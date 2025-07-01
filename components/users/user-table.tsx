"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Trash2,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { User } from "@/lib/types/user";
import { AddUserModal } from "./add-user-modal";
import { UserActionConfirmationDialog } from "./user-action-confirmation-dialog";
import { ChangeRoleModal } from "./change-role-modal";

type ActionState = {
  isOpen: boolean;
  user: User | null;
};

const UserRoleBadge = ({
  role,
  onClick,
}: {
  role: User["role"];
  onClick: () => void;
}) => {
  const roleColors: Record<User["role"], "primary" | "secondary" | "info" | "success"> = {
    Admin: "primary",
    PPL: "success",
    Dinas: "info",
    POPT: "secondary",
  };

  return (
    <Badge
      color={roleColors[role]}
      className="cursor-pointer hover:opacity-80"
      onClick={onClick}
    >
      {role}
    </Badge>
  );
};

export function UserTable({ data }: { data: User[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [changeRoleState, setChangeRoleState] = React.useState<ActionState>({ isOpen: false, user: null });
  const [resetPasswordState, setResetPasswordState] = React.useState<ActionState>({ isOpen: false, user: null });
  const [deleteUserState, setDeleteUserState] = React.useState<ActionState>({ isOpen: false, user: null });
  const [bulkDeleteState, setBulkDeleteState] = React.useState(false);

  const table = useReactTable({
    data,
    columns: getColumns({
      setChangeRoleState,
      setResetPasswordState,
      setDeleteUserState,
    }),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleBulkDelete = () => {
    toast.success(`${selectedRows.length} users have been deleted.`);
    setBulkDeleteState(false);
    table.resetRowSelection();
  };

  const handleResetPassword = () => {
    if (!resetPasswordState.user) return;
    const password = format(new Date(resetPasswordState.user.birthDate), "ddMMyy");
    toast.success(
      `Password for ${resetPasswordState.user.name} has been reset to ${password}`
    );
    setResetPasswordState({ isOpen: false, user: null });
  };
  
  const handleDeleteUser = () => {
    if (!deleteUserState.user) return;
    toast.success(`User ${deleteUserState.user.name} has been deleted.`);
    setDeleteUserState({ isOpen: false, user: null });
  };

  return (
    <TooltipProvider>
      <div className="w-full">
        <div className="flex items-center justify-between py-4">
          <Input
            placeholder="Filter users..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <div className="flex items-center gap-2">
            {selectedRows.length > 0 && (
              <Button
                color="destructive"
                onClick={() => setBulkDeleteState(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedRows.length})
              </Button>
            )}
            <Button onClick={() => setIsAddModalOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> Add User
            </Button>
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllColumns().length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {selectedRows.length} of {table.getFilteredRowModel().rows.length}{" "}
            row(s) selected.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Modals and Dialogs */}
      <AddUserModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
      <ChangeRoleModal
        user={changeRoleState.user}
        open={changeRoleState.isOpen}
        onOpenChange={(isOpen) => setChangeRoleState({ isOpen, user: isOpen ? changeRoleState.user : null })}
      />
      <UserActionConfirmationDialog
        open={resetPasswordState.isOpen}
        onOpenChange={(isOpen) => setResetPasswordState({ isOpen, user: isOpen ? resetPasswordState.user : null })}
        onConfirm={handleResetPassword}
        title="Are you sure?"
        description={`Do you want to reset the password for ${resetPasswordState.user?.name}? The new password will be their date of birth (DDMMYY).`}
      />
      <UserActionConfirmationDialog
        open={deleteUserState.isOpen}
        onOpenChange={(isOpen) => setDeleteUserState({ isOpen, user: isOpen ? deleteUserState.user : null })}
        onConfirm={handleDeleteUser}
        title="Are you absolutely sure?"
        description={`This action cannot be undone. This will permanently delete the user account for ${deleteUserState.user?.name}.`}
        confirmText="Yes, delete user"
      />
      <UserActionConfirmationDialog
        open={bulkDeleteState}
        onOpenChange={setBulkDeleteState}
        onConfirm={handleBulkDelete}
        title={`Delete ${selectedRows.length} Users?`}
        description="This action cannot be undone. Are you sure you want to permanently delete the selected users?"
        confirmText={`Yes, delete ${selectedRows.length} users`}
      />
    </TooltipProvider>
  );
}

// Moved columns to a function to pass state setters
const getColumns = ({
  setChangeRoleState,
  setResetPasswordState,
  setDeleteUserState,
}: {
  setChangeRoleState: React.Dispatch<React.SetStateAction<ActionState>>;
  setResetPasswordState: React.Dispatch<React.SetStateAction<ActionState>>;
  setDeleteUserState: React.Dispatch<React.SetStateAction<ActionState>>;
}): ColumnDef<User>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 relative">
            <Image
              src={user.avatar || "/images/avatar/av-1.svg"}
              alt={user.name}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-xs text-muted-foreground">{user.email || 'N/A'}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "nip",
    header: "NIP",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <UserRoleBadge
        role={row.original.role}
        onClick={() => setChangeRoleState({ isOpen: true, user: row.original })}
      />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const color = status === "active" ? "success" : "destructive";
      return (
        <Tooltip>
          <TooltipTrigger>
            <Badge color={color}>{status}</Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Account is {status}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "lastLogin",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Last Login
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const lastLogin = new Date(row.getValue("lastLogin"));
      return <div>{lastLogin.toLocaleDateString()}</div>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Aksi</div>,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(user.id)}
              >
                View User
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setResetPasswordState({ isOpen: true, user })}
              >
                Reset Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDeleteUserState({ isOpen: true, user })}
              >
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
