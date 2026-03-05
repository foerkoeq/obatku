"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Search, Trash2, ArrowUpDown, ArrowDown, ArrowUp, X } from "lucide-react";

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
import { FarmerGroup, farmerGroupsMock, FarmerGroupType } from "@/lib/data/farmer-groups-mock";
import { TUBAN_DAERAH } from "@/lib/data/tuban-daerah";
import { FarmerGroupDetailModal } from "@/components/farmers/farmer-group-detail-modal";

const SORTABLE_COLUMNS: Array<{
  key: "kecamatan" | "desa" | "jenis" | "namaKelompokTani";
  label: string;
}> = [
  { key: "kecamatan", label: "Kecamatan" },
  { key: "desa", label: "Desa" },
  { key: "jenis", label: "Jenis" },
  { key: "namaKelompokTani", label: "Nama Kelompok Tani" },
];

type SortField = (typeof SORTABLE_COLUMNS)[number]["key"];
type SortDirection = "asc" | "desc";

const SortHeaderButton = ({
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
}) => {
  const isActive = activeField === field;

  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 text-left hover:text-default-800"
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
};

export function FarmerGroupsTable() {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<FarmerGroup | null>(null);
  const [search, setSearch] = useState("");
  const [jenisFilter, setJenisFilter] = useState<"all" | FarmerGroupType>("all");
  const [kecamatanFilter, setKecamatanFilter] = useState("all");
  const [desaFilter, setDesaFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("kecamatan");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const kecamatanOptions = useMemo(() => TUBAN_DAERAH.map((item) => item.kecamatan), []);

  const desaOptions = useMemo(() => {
    if (kecamatanFilter === "all") {
      return Array.from(new Set(TUBAN_DAERAH.flatMap((item) => item.desa))).sort((a, b) =>
        a.localeCompare(b, "id")
      );
    }

    return (
      TUBAN_DAERAH.find((item) => item.kecamatan === kecamatanFilter)?.desa.sort((a, b) =>
        a.localeCompare(b, "id")
      ) ?? []
    );
  }, [kecamatanFilter]);

  const filteredAndSortedData = useMemo(() => {
    const loweredSearch = search.trim().toLowerCase();

    const filtered = farmerGroupsMock.filter((item) => {
      if (jenisFilter !== "all" && item.jenis !== jenisFilter) {
        return false;
      }

      if (kecamatanFilter !== "all" && item.kecamatan !== kecamatanFilter) {
        return false;
      }

      if (desaFilter !== "all" && item.desa !== desaFilter) {
        return false;
      }

      if (!loweredSearch) {
        return true;
      }

      const searchFields = [
        item.kecamatan,
        item.desa,
        item.jenis,
        item.namaKelompokTani,
        item.namaGapoktan,
        ...item.poktan.map((poktan) => poktan.namaPoktan),
        ...item.poktan.map((poktan) => poktan.ketua.nama),
        item.ketuaGapoktan?.nama,
      ];

      return searchFields.some((field) => field?.toLowerCase().includes(loweredSearch));
    });

    return filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      const compared = String(aValue).localeCompare(String(bValue), "id", {
        sensitivity: "base",
      });

      return sortDirection === "asc" ? compared : -compared;
    });
  }, [search, jenisFilter, kecamatanFilter, desaFilter, sortField, sortDirection]);

  const activeFilterCount = [
    Boolean(search.trim()),
    jenisFilter !== "all",
    kecamatanFilter !== "all",
    desaFilter !== "all",
  ].filter(Boolean).length;

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection("asc");
  };

  const clearFilter = () => {
    setSearch("");
    setJenisFilter("all");
    setKecamatanFilter("all");
    setDesaFilter("all");
  };

  const handleEdit = (item: FarmerGroup) => {
    router.push(`/farmers/${item.id}/edit`);
  };

  const handleDelete = (item: FarmerGroup) => {
    toast.success(`Mock hapus data: ${item.namaKelompokTani}`);
    if (selectedItem?.id === item.id) {
      setSelectedItem(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-default-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari kecamatan, desa, nama kelompok, atau ketua..."
                className="pl-9"
              />
            </div>

            {activeFilterCount > 0 && (
              <Button variant="ghost" className="gap-1.5 w-full sm:w-auto" onClick={clearFilter}>
                <X className="h-4 w-4" />
                Hapus Filter
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Select
              value={jenisFilter}
              onValueChange={(value) => setJenisFilter(value as "all" | FarmerGroupType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter Jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                <SelectItem value="Poktan">Poktan</SelectItem>
                <SelectItem value="Gapoktan">Gapoktan</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={kecamatanFilter}
              onValueChange={(value) => {
                setKecamatanFilter(value);
                setDesaFilter("all");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter Kecamatan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kecamatan</SelectItem>
                {kecamatanOptions.map((kecamatan) => (
                  <SelectItem key={kecamatan} value={kecamatan}>
                    {kecamatan}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={desaFilter} onValueChange={(value) => setDesaFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter Desa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Desa</SelectItem>
                {desaOptions.map((desa) => (
                  <SelectItem key={desa} value={desa}>
                    {desa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3 md:hidden">
        {filteredAndSortedData.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-default-500">
              Data kelompok tani tidak ditemukan.
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedData.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => setSelectedItem(item)}
            >
              <CardContent className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-default-500">
                      {item.kecamatan} • {item.desa}
                    </p>
                    <h3 className="font-semibold text-default-900 text-sm">{item.namaKelompokTani}</h3>
                  </div>
                  <Badge color={item.jenis === "Gapoktan" ? "info" : "success"}>{item.jenis}</Badge>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t" onClick={(event) => event.stopPropagation()}>
                  <Button variant="outline" size="icon" onClick={() => handleEdit(item)} aria-label="Edit data kelompok tani">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button color="destructive" variant="outline" size="icon" onClick={() => handleDelete(item)} aria-label="Hapus data kelompok tani">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-default-50/60">
                {SORTABLE_COLUMNS.map((column) => (
                  <TableHead key={column.key}>
                    <SortHeaderButton
                      label={column.label}
                      field={column.key}
                      activeField={sortField}
                      activeDirection={sortDirection}
                      onClick={handleSort}
                    />
                  </TableHead>
                ))}
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredAndSortedData.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center text-default-500" colSpan={5}>
                    Data kelompok tani tidak ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedData.map((item) => (
                  <TableRow
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="cursor-pointer hover:bg-default-50/70"
                  >
                    <TableCell>{item.kecamatan}</TableCell>
                    <TableCell>{item.desa}</TableCell>
                    <TableCell>
                      <Badge color={item.jenis === "Gapoktan" ? "info" : "success"}>{item.jenis}</Badge>
                    </TableCell>
                    <TableCell className="font-medium text-default-800">{item.namaKelompokTani}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2" onClick={(event) => event.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(item)}
                          aria-label="Edit data kelompok tani"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          color="destructive"
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(item)}
                          aria-label="Hapus data kelompok tani"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <FarmerGroupDetailModal
        open={Boolean(selectedItem)}
        data={selectedItem}
        onClose={() => setSelectedItem(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
