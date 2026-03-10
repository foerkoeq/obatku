"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Search,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  X,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  MapPin,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, USER_ROLES, UserRoleType } from "@/lib/types/user";
import { users as usersMock } from "@/lib/data/user-demo";
import { UserDetailModal } from "./user-detail-modal";
import { UserActionConfirmationDialog } from "./user-action-confirmation-dialog";
import { ChangeRoleModal } from "./change-role-modal";

// --- Constants ---

const ROLE_COLORS: Record<UserRoleType, string> = {
  Admin: "primary",
  Kabid: "violet",
  Kasubbid: "indigo",
  "Staf Dinas": "info",
  BPP: "warning",
  PPL: "success",
  POPT: "secondary",
};

const ROLE_LABELS: Record<UserRoleType, string> = {
  Admin: "Admin",
  Kabid: "Kabid",
  Kasubbid: "Kasubbid",
  "Staf Dinas": "Staf Dinas",
  BPP: "BPP",
  PPL: "PPL",
  POPT: "POPT",
};

type SortField = "name" | "username" | "lokasi" | "role";
type SortDirection = "asc" | "desc";

const SORTABLE_COLUMNS: Array<{ key: SortField; label: string }> = [
  { key: "name", label: "Nama" },
  { key: "username", label: "Username" },
  { key: "lokasi", label: "Lokasi" },
  { key: "role", label: "Role" },
];

// --- Sub-components ---

function RoleBadge({ role }: { role: UserRoleType }) {
  return (
    <Badge color={ROLE_COLORS[role] as any} className="whitespace-nowrap">
      {ROLE_LABELS[role]}
    </Badge>
  );
}

function StatusDot({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${
        isActive ? "bg-success" : "bg-default-300"
      }`}
      title={isActive ? "Aktif" : "Nonaktif"}
    />
  );
}

function SortHeaderButton({
  label,
  field,
  activeField,
  activeDirection,
  onClick,
}: {
  label: string;
  field: SortField;
  activeField: SortField;
  activeDirection: SortDirection;
  onClick: (field: SortField) => void;
}) {
  const isActive = activeField === field;

  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 text-left hover:text-default-800 font-medium"
      onClick={() => onClick(field)}
    >
      <span>{label}</span>
      {isActive ? (
        activeDirection === "asc" ? (
          <ArrowUp className="h-3.5 w-3.5" />
        ) : (
          <ArrowDown className="h-3.5 w-3.5" />
        )
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 text-default-400" />
      )}
    </button>
  );
}

function LokasiDisplay({ lokasi }: { lokasi: string }) {
  if (lokasi === "Admin" || lokasi === "Dinas") {
    return <span className="text-default-700">{lokasi === "Admin" ? "Admin" : "Dinas Pertanian"}</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-default-700">
      <MapPin className="h-3 w-3 text-default-400 shrink-0" />
      Kec. {lokasi}
    </span>
  );
}

// --- Main Component ---

export function UserTable() {
  const router = useRouter();
  const [data, setData] = useState<User[]>(usersMock);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRoleType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Detail / Delete / ChangeRole modal state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [changeRoleUser, setChangeRoleUser] = useState<User | null>(null);

  // Derived: lokasi options from data
  const lokasiOptions = useMemo(() => {
    const unique = Array.from(new Set(data.map((u) => u.lokasi))).sort((a, b) =>
      a.localeCompare(b, "id")
    );
    return unique;
  }, [data]);

  // Filter + sort
  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = data.filter((user) => {
      if (roleFilter !== "all" && user.role !== roleFilter) return false;
      if (statusFilter !== "all") {
        if (statusFilter === "active" && !user.isActive) return false;
        if (statusFilter === "inactive" && user.isActive) return false;
      }
      if (!q) return true;

      return [user.name, user.username, user.nip, user.lokasi, user.role, user.jabatan]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q));
    });

    return filtered.sort((a, b) => {
      const aVal = a[sortField] ?? "";
      const bVal = b[sortField] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal), "id", { sensitivity: "base" });
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [data, search, roleFilter, statusFilter, sortField, sortDirection]);

  // Active filter count (for clear button)
  const activeFilterCount = [
    Boolean(search.trim()),
    roleFilter !== "all",
    statusFilter !== "all",
  ].filter(Boolean).length;

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  const handleDelete = (user: User) => {
    setData((prev) => prev.filter((u) => u.id !== user.id));
    toast.success(`Pengguna ${user.name} berhasil dihapus.`);
    setDeleteUser(null);
    if (selectedUser?.id === user.id) setSelectedUser(null);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-default-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, username, NIP, lokasi..."
                className="pl-9"
              />
            </div>

            {activeFilterCount > 0 && (
              <Button variant="ghost" className="gap-1.5 w-full sm:w-auto" onClick={clearFilters}>
                <X className="h-4 w-4" />
                Hapus Filter
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Select
              value={roleFilter}
              onValueChange={(v) => setRoleFilter(v as "all" | UserRoleType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Role</SelectItem>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as "all" | "active" | "inactive")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-default-500">
          <span className="font-medium text-default-700">{filteredData.length}</span> pengguna
          {activeFilterCount > 0 && (
            <span> (dari {data.length} total)</span>
          )}
        </p>
      </div>

      {/* ========== MOBILE CARDS ========== */}
      <div className="space-y-3 md:hidden">
        {filteredData.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="mx-auto h-10 w-10 text-default-300 mb-2" />
              <p className="text-sm text-default-500">Pengguna tidak ditemukan.</p>
            </CardContent>
          </Card>
        ) : (
          filteredData.map((user) => (
            <Card
              key={user.id}
              className="cursor-pointer hover:shadow-sm transition-shadow active:bg-default-50/50"
              onClick={() => setSelectedUser(user)}
            >
              <CardContent className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <StatusDot isActive={user.isActive} />
                      <h3 className="font-semibold text-default-900 text-sm truncate">
                        {user.name}
                      </h3>
                    </div>
                    <p className="text-xs text-default-500 truncate">@{user.username}</p>
                  </div>
                  <RoleBadge role={user.role} />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-default-100">
                  <div className="text-xs text-default-500">
                    <LokasiDisplay lokasi={user.lokasi} />
                  </div>
                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setSelectedUser(user)}
                      aria-label="Lihat detail"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setDeleteUser(user)}
                      aria-label="Hapus pengguna"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ========== DESKTOP TABLE ========== */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-default-50/60">
                {SORTABLE_COLUMNS.map((col) => (
                  <TableHead key={col.key}>
                    <SortHeaderButton
                      label={col.label}
                      field={col.key}
                      activeField={sortField}
                      activeDirection={sortDirection}
                      onClick={handleSort}
                    />
                  </TableHead>
                ))}
                <TableHead>
                  <span className="font-medium">Status</span>
                </TableHead>
                <TableHead className="text-center">
                  <span className="font-medium">Aksi</span>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center text-default-500 py-12" colSpan={6}>
                    <Users className="mx-auto h-10 w-10 text-default-300 mb-2" />
                    <p>Pengguna tidak ditemukan.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((user) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer hover:bg-default-50/70"
                    onClick={() => setSelectedUser(user)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusDot isActive={user.isActive} />
                        <span className="font-medium text-default-900">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-default-600">@{user.username}</TableCell>
                    <TableCell>
                      <LokasiDisplay lokasi={user.lokasi} />
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        color={user.isActive ? "success" : "default"}
                        className="text-[11px]"
                      >
                        {user.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div
                        className="flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <span className="sr-only">Buka menu aksi</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/users/${user.id}/edit`)}
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteUser(user)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <UserDetailModal
        open={Boolean(selectedUser)}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onEdit={(user) => {
          setSelectedUser(null);
          router.push(`/users/${user.id}/edit`);
        }}
        onDelete={(user) => {
          setSelectedUser(null);
          setDeleteUser(user);
        }}
        onChangeRoleStatus={(user) => {
          setSelectedUser(null);
          setChangeRoleUser(user);
        }}
      />

      {/* Delete Confirmation */}
      <UserActionConfirmationDialog
        open={Boolean(deleteUser)}
        onOpenChange={(open) => {
          if (!open) setDeleteUser(null);
        }}
        onConfirm={() => {
          if (deleteUser) handleDelete(deleteUser);
        }}
        title="Hapus Pengguna?"
        description={`Tindakan ini tidak bisa dibatalkan. Pengguna "${deleteUser?.name}" akan dihapus secara permanen dari sistem.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
      />

      {/* Change Role & Status Modal */}
      <ChangeRoleModal
        user={changeRoleUser}
        open={Boolean(changeRoleUser)}
        onOpenChange={(open) => {
          if (!open) setChangeRoleUser(null);
        }}
        onSuccess={({ role, isActive, lokasi }) => {
          if (changeRoleUser) {
            setData((prev) =>
              prev.map((u) =>
                u.id === changeRoleUser.id
                  ? { ...u, role, isActive, lokasi, status: isActive ? "active" : "inactive" }
                  : u
              )
            );
          }
          setChangeRoleUser(null);
        }}
      />
    </div>
  );
}
