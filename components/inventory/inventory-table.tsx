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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import StatusIndicator from "./status-indicator";
import { Badge } from "@/components/ui/badge";
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
        <div className="flex items-center justify-center">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={handleSelectAll}
            aria-label="Select all"
            className="h-3.5 w-3.5"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={selectedItems.includes(row.original.id)}
            onCheckedChange={(checked) => handleSelectItem(row.original.id, checked as boolean)}
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
            className="h-3.5 w-3.5"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 35,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent text-xs"
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
            className="ml-1 h-3 w-3"
          />
        </Button>
      ),
      cell: ({ row }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[120px]">
                <div className="font-medium text-xs text-default-900 truncate">
                  {row.original.name}
                </div>
                <div className="text-[10px] text-default-500 truncate">
                  {row.original.producer}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                <div className="font-medium">{row.original.name}</div>
                <div className="text-default-400">{row.original.producer}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
      size: 130,
    },
    {
      accessorKey: "content",
      header: () => <span className="text-xs">Kandungan</span>,
      cell: ({ row }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs truncate block max-w-[90px]">
                {row.original.content}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <span className="text-xs">{row.original.content}</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
      size: 100,
    },
    {
      accessorKey: "category",
      header: () => <span className="text-xs">Kategori</span>,
      cell: ({ row }) => (
        <span className="text-xs truncate block max-w-[70px]">
          {row.original.category.name}
        </span>
      ),
      size: 80,
    },
    {
      accessorKey: "stock",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent text-xs"
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
            className="ml-1 h-3 w-3"
          />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-xs whitespace-nowrap">
          <span className="font-medium">{row.original.stock}</span>
          <span className="text-default-500 ml-0.5 text-[10px]">{row.original.unit}</span>
        </div>
      ),
      size: 65,
    },
    {
      accessorKey: "expiryDate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent text-xs"
        >
          Kadaluarsa
          <Icon
            icon={
              column.getIsSorted() === "asc"
                ? "heroicons:chevron-up"
                : column.getIsSorted() === "desc"
                ? "heroicons:chevron-down"
                : "heroicons:chevron-up-down"
            }
            className="ml-1 h-3 w-3"
          />
        </Button>
      ),
      cell: ({ row }) => {
        const expiryDates = Array.isArray(row.original.expiryDate) 
          ? row.original.expiryDate 
          : [row.original.expiryDate];
        
        if (expiryDates.length === 1) {
          return (
            <span className="text-xs whitespace-nowrap">
              {format(new Date(expiryDates[0]), "dd/MM/yy", { locale: id })}
            </span>
          );
        }
        
        const firstDate = format(new Date(expiryDates[0]), "dd/MM/yy", { locale: id });
        const allDates = expiryDates.map(d => format(new Date(d), "dd/MM/yyyy", { locale: id })).join(", ");
        
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <span className="text-xs whitespace-nowrap">{firstDate}</span>
                  <Badge color="info" rounded="sm" className="text-[10px] px-1 py-0">
                    +{expiryDates.length - 1}
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs space-y-1">
                  {expiryDates.map((date, idx) => (
                    <div key={idx}>{format(new Date(date), "dd/MM/yyyy", { locale: id })}</div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
      size: 85,
    },
    {
      accessorKey: "targetPest",
      header: () => <span className="text-xs">OPT</span>,
      cell: ({ row }) => {
        const pests = row.original.targetPest;
        if (pests.length === 0) {
          return <span className="text-xs text-default-400">-</span>;
        }
        if (pests.length === 1) {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs truncate block max-w-[70px]">
                    {pests[0]}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <span className="text-xs">{pests[0]}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
        const allPests = pests.join(", ");
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <span className="text-xs truncate max-w-[50px]">{pests[0]}</span>
                  <Badge color="blue" rounded="sm" className="text-[10px] px-1 py-0">
                    +{pests.length - 1}
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs space-y-1">
                  {pests.map((pest, idx) => (
                    <div key={idx}>{pest}</div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
      size: 80,
    },
    {
      accessorKey: "sumber",
      header: () => <span className="text-xs">Sumber</span>,
      cell: ({ row }) => {
        const sumber = row.original.sumber || row.original.supplier || '-';
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs truncate block max-w-[60px]">
                  {sumber}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <span className="text-xs">{sumber}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
      size: 70,
    },
    {
      accessorKey: "status",
      header: () => <span className="text-xs">Status</span>,
      cell: ({ row }) => (
        <div className="flex items-center">
          <StatusIndicator status={row.original.status} />
        </div>
      ),
      size: 75,
    },
    {
      id: "actions",
      header: () => <span className="text-xs">Aksi</span>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => e.stopPropagation()}
              >
                <Icon icon="heroicons:ellipsis-vertical" className="h-3.5 w-3.5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => onRowClick?.(row.original)}
                className="cursor-pointer text-xs"
              >
                <Icon icon="heroicons:eye" className="mr-2 h-3.5 w-3.5" />
                Lihat Detail
              </DropdownMenuItem>
              
              {onViewBarcode && (
                <DropdownMenuItem
                  onClick={() => onViewBarcode(row.original)}
                  className="cursor-pointer text-xs"
                >
                  <Icon icon="heroicons:qr-code" className="mr-2 h-3.5 w-3.5" />
                  Lihat Barcode
                </DropdownMenuItem>
              )}

              {canEdit && onEdit && (
                <DropdownMenuItem
                  onClick={() => onEdit(row.original)}
                  className="cursor-pointer text-xs"
                >
                  <Icon icon="heroicons:pencil" className="mr-2 h-3.5 w-3.5" />
                  Edit
                </DropdownMenuItem>
              )}

              {canDelete && onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(row.original)}
                  className="cursor-pointer text-destructive focus:text-destructive text-xs"
                >
                  <Icon icon="heroicons:trash" className="mr-2 h-3.5 w-3.5" />
                  Hapus
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      size: 55,
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
        {/* Desktop loading */}
        <div className="hidden lg:block">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="h-10">
                {columns.map((col, index) => (
                  <TableHead 
                    key={index} 
                    className="px-2"
                  >
                    <Skeleton className="h-3 w-full" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index} className="h-10">
                  {columns.map((col, cellIndex) => (
                    <TableCell 
                      key={cellIndex} 
                      className="px-2 py-1.5"
                    >
                      <Skeleton className="h-3 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile/Tablet loading */}
        <div className="lg:hidden overflow-x-auto -mx-4 px-4">
          <Table className="w-full min-w-[800px]">
            <TableHeader>
              <TableRow className="h-10">
                {columns.map((col, index) => (
                  <TableHead 
                    key={index} 
                    className="px-2"
                  >
                    <Skeleton className="h-3 w-full" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index} className="h-10">
                  {columns.map((col, cellIndex) => (
                    <TableCell 
                      key={cellIndex} 
                      className="px-2 py-1.5"
                    >
                      <Skeleton className="h-3 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-md border", className)}>
      {/* Desktop: No scroll, compact layout */}
      <div className="hidden lg:block">
        <Table className="w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="h-10">
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id} 
                    className="font-medium whitespace-nowrap px-2 text-xs"
                  >
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
                    "cursor-pointer hover:bg-default-50 h-10",
                    selectedItems.includes(row.original.id) && "bg-blue-50"
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id} 
                      className="px-2 py-1.5 align-middle"
                    >
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
                    <p className="text-default-500 text-sm">Tidak ada data ditemukan</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile/Tablet: Horizontal scroll dengan compact layout */}
      <div className="lg:hidden overflow-x-auto -mx-4 px-4">
        <Table className="w-full min-w-[800px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="h-10">
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id} 
                    className="font-medium whitespace-nowrap px-2 text-xs"
                  >
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
                    "cursor-pointer hover:bg-default-50 h-10",
                    selectedItems.includes(row.original.id) && "bg-blue-50"
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id} 
                      className="px-2 py-1.5 align-middle"
                    >
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
                    <p className="text-default-500 text-sm">Tidak ada data ditemukan</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InventoryTable;

// # END OF Inventory Table Component 