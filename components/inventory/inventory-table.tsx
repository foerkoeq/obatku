// # START OF Inventory Table Component - Data table for drug inventory management
// Purpose: Display drug inventory data with sorting, pagination, and actions
// Props: data, onSort, onRowClick, onEdit, onDelete, userRole, loading
// Returns: Interactive data table with responsive design
// Dependencies: Table UI components, TanStack Table, Status Indicator

"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import StatusIndicator from "./status-indicator";
import { DrugInventory, UserRole } from "@/lib/types/inventory";
import { cn } from "@/lib/utils";

interface InventoryTableProps {
  data: DrugInventory[];
  onSort?: (sorting: SortingState) => void;
  onRowClick?: (item: DrugInventory) => void;
  onEdit?: (item: DrugInventory) => void;
  onDelete?: (item: DrugInventory) => void;
  onViewBarcode?: (item: DrugInventory) => void;
  userRole: UserRole;
  loading?: boolean;
  className?: string;
  selectedItems?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
  data,
  onSort,
  onRowClick,
  onEdit,
  onDelete,
  onViewBarcode,
  userRole,
  loading = false,
  className,
  selectedItems = [],
  onSelectionChange,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const canEdit = userRole !== 'ppl';
  const canDelete = userRole === 'admin' || userRole === 'popt';

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(data.map(item => item.id));
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedItems, itemId]);
    } else {
      onSelectionChange?.(selectedItems.filter(id => id !== itemId));
    }
  };

  const isAllSelected = data.length > 0 && selectedItems.length === data.length;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < data.length;

  const columns: ColumnDef<DrugInventory>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={handleSelectAll}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedItems.includes(row.original.id)}
          onCheckedChange={(checked) => handleSelectItem(row.original.id, checked as boolean)}
          aria-label="Select row"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Nama Obat
          <Icon
            icon={
              column.getIsSorted() === "asc"
                ? "heroicons:chevron-up"
                : column.getIsSorted() === "desc"
                ? "heroicons:chevron-down"
                : "heroicons:chevron-up-down"
            }
            className="ml-2 h-4 w-4"
          />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium text-default-900">{row.original.name}</div>
          <div className="text-xs text-default-500">{row.original.producer}</div>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Kategori",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.category.name}</span>
      ),
    },
    {
      accessorKey: "stock",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Stok
          <Icon
            icon={
              column.getIsSorted() === "asc"
                ? "heroicons:chevron-up"
                : column.getIsSorted() === "desc"
                ? "heroicons:chevron-down"
                : "heroicons:chevron-up-down"
            }
            className="ml-2 h-4 w-4"
          />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          <span className="font-medium">{row.original.stock}</span>
          <span className="text-default-500 ml-1">{row.original.unit}</span>
        </div>
      ),
    },
    {
      accessorKey: "expiryDate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          Tanggal Kadaluarsa
          <Icon
            icon={
              column.getIsSorted() === "asc"
                ? "heroicons:chevron-up"
                : column.getIsSorted() === "desc"
                ? "heroicons:chevron-down"
                : "heroicons:chevron-up-down"
            }
            className="ml-2 h-4 w-4"
          />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {format(new Date(row.original.expiryDate), "dd/MM/yyyy", { locale: id })}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusIndicator status={row.original.status} />
      ),
    },
    {
      accessorKey: "targetPest",
      header: "Jenis OPT",
      cell: ({ row }) => (
        <div className="text-sm max-w-32 truncate">
          {row.original.targetPest.join(", ")}
        </div>
      ),
    },
    {
      accessorKey: "supplier",
      header: "Supplier",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.supplier}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <Icon icon="heroicons:ellipsis-vertical" className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => onRowClick?.(row.original)}
                className="cursor-pointer"
              >
                <Icon icon="heroicons:eye" className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>
              
              {onViewBarcode && (
                <DropdownMenuItem
                  onClick={() => onViewBarcode(row.original)}
                  className="cursor-pointer"
                >
                  <Icon icon="heroicons:qr-code" className="mr-2 h-4 w-4" />
                  Lihat Barcode
                </DropdownMenuItem>
              )}

              {canEdit && onEdit && (
                <DropdownMenuItem
                  onClick={() => onEdit(row.original)}
                  className="cursor-pointer"
                >
                  <Icon icon="heroicons:pencil" className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}

              {canDelete && onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(row.original)}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Icon icon="heroicons:trash" className="mr-2 h-4 w-4" />
                  Hapus
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(newSorting);
      onSort?.(newSorting);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  if (loading) {
    return (
      <div className={cn("rounded-md border", className)}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((_, index) => (
                <TableHead key={index}>
                  <Skeleton className="h-4 w-full" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {columns.map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="font-medium">
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
                className={cn(
                  "cursor-pointer hover:bg-default-50",
                  selectedItems.includes(row.original.id) && "bg-blue-50"
                )}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-4">
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
                colSpan={columns.length}
                className="h-24 text-center"
              >
                <div className="flex flex-col items-center justify-center py-8">
                  <Icon 
                    icon="heroicons:inbox" 
                    className="h-12 w-12 text-default-400 mb-4" 
                  />
                  <p className="text-default-500">Tidak ada data ditemukan</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default InventoryTable;

// # END OF Inventory Table Component 