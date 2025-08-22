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
  Edit,
  Eye,
  Download,
  Filter,
  Search,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { format } from "date-fns";
import { useEffect, useState } from "react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/lib/types/user";
import { userService, UserFilters, PaginationParams } from "@/lib/services/user.service";
import { AddUserModal } from "./add-user-modal";
import { EditUserModal } from "./edit-user-modal";
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

export function UserTable() {
  // Table state
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  // Data state
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editUserState, setEditUserState] = React.useState<ActionState>({ isOpen: false, user: null });
  const [changeRoleState, setChangeRoleState] = React.useState<ActionState>({ isOpen: false, user: null });
  const [resetPasswordState, setResetPasswordState] = React.useState<ActionState>({ isOpen: false, user: null });
  const [deleteUserState, setDeleteUserState] = React.useState<ActionState>({ isOpen: false, user: null });
  const [bulkDeleteState, setBulkDeleteState] = React.useState(false);

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      const pagination: PaginationParams = {
        page: currentPage,
        limit: pageSize,
      };

      const filters: UserFilters = {
        search: searchQuery,
        role: roleFilter || undefined,
        isActive: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
        sort: sorting.length > 0 ? sorting[0].id : undefined,
        order: sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : undefined,
      };

      const response = await userService.getUsers(pagination, filters);
      
      if (response.success) {
        setUsers(response.data || []);
        setTotalUsers(response.total || 0);
      } else {
        toast.error("Failed to fetch users", {
          description: response.message || "An error occurred while fetching users",
        });
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users", {
        description: error.message || "An error occurred while fetching users",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize, searchQuery, roleFilter, statusFilter, sorting]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
      fetchUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle filters
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [roleFilter, statusFilter]);

  const table = useReactTable({
    data: users,
    columns: getColumns({
      setEditUserState,
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
    manualPagination: true,
    pageCount: Math.ceil(totalUsers / pageSize),
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      const userIds = selectedRows.map(row => row.original.id);
      const response = await userService.bulkDeleteUsers(userIds);
      
      if (response.success) {
        toast.success(`${userIds.length} users have been deleted.`);
        setBulkDeleteState(false);
        table.resetRowSelection();
        fetchUsers(); // Refresh data
      } else {
        toast.error("Failed to delete users", {
          description: response.message || "An error occurred while deleting users",
        });
      }
    } catch (error: any) {
      console.error("Error deleting users:", error);
      toast.error("Failed to delete users", {
        description: error.message || "An error occurred while deleting users",
      });
    }
  };

  // Handle reset password
  const handleResetPassword = async () => {
    if (!resetPasswordState.user) return;
    
    try {
      const password = format(new Date(resetPasswordState.user.birthDate), "ddMMyy");
      const response = await userService.resetUserPassword(resetPasswordState.user.id, password);
      
      if (response.success) {
        toast.success(
          `Password for ${resetPasswordState.user.name} has been reset to ${password}`
        );
        setResetPasswordState({ isOpen: false, user: null });
      } else {
        toast.error("Failed to reset password", {
          description: response.message || "An error occurred while resetting password",
        });
      }
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast.error("Failed to reset password", {
        description: error.message || "An error occurred while resetting password",
      });
    }
  };
  
  // Handle delete user
  const handleDeleteUser = async () => {
    if (!deleteUserState.user) return;
    
    try {
      const response = await userService.deleteUser(deleteUserState.user.id);
      
      if (response.success) {
        toast.success(`User ${deleteUserState.user.name} has been deleted.`);
        setDeleteUserState({ isOpen: false, user: null });
        fetchUsers(); // Refresh data
      } else {
        toast.error("Failed to delete user", {
          description: response.message || "An error occurred while deleting user",
        });
      }
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user", {
        description: error.message || "An error occurred while deleting user",
      });
    }
  };

  // Handle export
  const handleExport = async (format: 'excel' | 'csv') => {
    try {
      const filters: UserFilters = {
        search: searchQuery,
        role: roleFilter || undefined,
        isActive: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
      };

      const blob = await userService.exportUsers(format, filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Users exported to ${format.toUpperCase()} successfully!`);
    } catch (error: any) {
      console.error("Error exporting users:", error);
      toast.error("Failed to export users", {
        description: error.message || "An error occurred while exporting users",
      });
    }
  };

  // Handle success callbacks
  const handleUserCreated = () => {
    fetchUsers();
  };

  const handleUserUpdated = () => {
    fetchUsers();
  };

  return (
    <TooltipProvider>
      <div className="w-full">
        {/* Filters and Actions */}
        <div className="flex flex-col gap-4 py-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users by name, email, or NIP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Roles</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="PPL">PPL</SelectItem>
                <SelectItem value="Dinas">Dinas</SelectItem>
                <SelectItem value="POPT">POPT</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedRows.length > 0 && (
                <Button
                  color="destructive"
                  onClick={() => setBulkDeleteState(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedRows.length})
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleExport('excel')}
              >
                <Download className="mr-2 h-4 w-4" /> Export Excel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('csv')}
              >
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" /> Add User
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
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
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllColumns().length}
                    className="h-24 text-center"
                  >
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Loading users...
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllColumns().length}
                    className="h-24 text-center"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
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
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {selectedRows.length} of {totalUsers} row(s) selected.
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Page size:</span>
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {Math.ceil(totalUsers / pageSize)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= Math.ceil(totalUsers / pageSize)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals and Dialogs */}
      <AddUserModal 
        open={isAddModalOpen} 
        onOpenChange={setIsAddModalOpen}
        onSuccess={handleUserCreated}
      />
      
      <EditUserModal
        user={editUserState.user}
        open={editUserState.isOpen}
        onOpenChange={(isOpen) => setEditUserState({ isOpen, user: isOpen ? editUserState.user : null })}
        onSuccess={handleUserUpdated}
      />
      
      <ChangeRoleModal
        user={changeRoleState.user}
        open={changeRoleState.isOpen}
        onOpenChange={(isOpen) => setChangeRoleState({ isOpen, user: isOpen ? changeRoleState.user : null })}
        onSuccess={handleUserUpdated}
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
  setEditUserState,
  setChangeRoleState,
  setResetPasswordState,
  setDeleteUserState,
}: {
  setEditUserState: React.Dispatch<React.SetStateAction<ActionState>>;
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
                onClick={() => setEditUserState({ isOpen: true, user })}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setChangeRoleState({ isOpen: true, user })}
              >
                <UserRoleBadge role={user.role} onClick={() => {}} />
                Change Role
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setResetPasswordState({ isOpen: true, user })}
              >
                <Eye className="w-4 h-4 mr-2" />
                Reset Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDeleteUserState({ isOpen: true, user })}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
