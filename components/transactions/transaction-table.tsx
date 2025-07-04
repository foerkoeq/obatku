// # START OF Transaction Table Component - Data table for transaction management
// Purpose: Display transaction data with sorting, pagination, and role-based actions
// Props: data, onSort, onRowClick, onEdit, onDelete, onApprove, onDistribute, userRole, loading
// Returns: Interactive data table with responsive design
// Dependencies: Table UI components, TanStack Table, Transaction Status Indicator

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@iconify/react";
import { HydrationSafe } from "@/components/ui/hydration-safe";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import TransactionStatusIndicator, { statusNeedsAction } from "./transaction-status-indicator";
import { Transaction, UserRole, getRolePermissions } from "@/lib/types/transaction";
import { cn } from "@/lib/utils";

interface TransactionTableProps {
  data: Transaction[];
  onSort?: (sorting: SortingState) => void;
  onRowClick?: (item: Transaction) => void;
  onEdit?: (item: Transaction) => void;
  onDelete?: (item: Transaction) => void;
  onApprove?: (item: Transaction) => void;
  onDistribute?: (item: Transaction) => void;
  onViewDetails?: (item: Transaction) => void;
  userRole: UserRole;
  loading?: boolean;
  className?: string;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  data,
  onSort,
  onRowClick,
  onEdit,
  onDelete,
  onApprove,
  onDistribute,
  onViewDetails,
  userRole,
  loading = false,
  className,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const permissions = getRolePermissions(userRole);

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "letterNumber",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          No. Surat
          <HydrationSafe fallback={<div className="ml-2 h-4 w-4 bg-current opacity-50 rounded-sm" />}>
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
          </HydrationSafe>
        </Button>
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium text-default-900 text-sm">
            {row.original.letterNumber}
          </div>
          <div className="text-xs text-default-500">
            {format(new Date(row.original.submissionDate), "dd/MM/yyyy", { locale: id })}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "bppOfficer.name",
      header: "Petugas BPP",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium text-default-900 text-sm">
            {row.original.bppOfficer.name}
          </div>
          <div className="text-xs text-default-500">
            {row.original.bppOfficer.position}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "farmerGroup.name",
      header: "Kelompok Tani",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium text-default-900 text-sm">
            {row.original.farmerGroup.name}
          </div>
          <div className="text-xs text-default-500">
            Ketua: {row.original.farmerGroup.leader}
          </div>
          <div className="text-xs text-default-500">
            {row.original.farmerGroup.district}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "farmingDetails",
      header: "Detail Pertanian",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium text-default-900 text-sm">
            {row.original.farmingDetails.commodity}
          </div>
          <div className="text-xs text-default-500">
            Luas: {row.original.farmingDetails.affectedArea} ha dari {row.original.farmingDetails.totalArea} ha
          </div>
          <div className="text-xs text-default-500">
            {row.original.farmingDetails.pestType.slice(0, 2).join(", ")}
            {row.original.farmingDetails.pestType.length > 2 && (
              <span className="text-default-400"> +{row.original.farmingDetails.pestType.length - 2} lainnya</span>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const needsAction = statusNeedsAction(row.original.status, userRole);
        return (
          <div className="flex flex-col gap-1">
            <TransactionStatusIndicator 
              status={row.original.status} 
              priority={row.original.priority}
              showText={true}
            />
            {needsAction && (
              <Badge className="text-xs text-red-600 border border-red-200 bg-red-50">
                <HydrationSafe fallback={<div className="h-3 w-3 mr-1 bg-current opacity-50 rounded-sm" />}>
                  <Icon icon="heroicons:exclamation-triangle" className="h-3 w-3 mr-1" />
                </HydrationSafe>
                Butuh Tindakan
              </Badge>
            )}
          </div>
        );
      },
    },
    ...(permissions.viewScope === 'all' ? [{
      id: "requestedDrugs",
      header: "Obat Diminta",
      cell: ({ row }: { row: any }) => (
        <div className="text-sm max-w-32">
          {row.original.submission.requestedDrugs?.length > 0 ? (
            <div className="space-y-1">
              {row.original.submission.requestedDrugs.slice(0, 2).map((drug: any, idx: number) => (
                <div key={idx} className="text-xs text-default-600">
                  {drug.drugName} ({drug.requestedQuantity} {drug.unit})
                </div>
              ))}
              {row.original.submission.requestedDrugs.length > 2 && (
                <div className="text-xs text-default-400">
                  +{row.original.submission.requestedDrugs.length - 2} lainnya
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-default-400">Belum ada</span>
          )}
        </div>
      ),
    }] : []),
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const needsAction = statusNeedsAction(row.original.status, userRole);
        const canApprove = permissions.canApprove && ['submitted', 'under_review'].includes(row.original.status);
        const canDistribute = permissions.canDistribute && ['approved', 'ready_distribution'].includes(row.original.status);
        const canEdit = permissions.canEdit && ['draft'].includes(row.original.status);

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8",
                    needsAction && "bg-red-50 hover:bg-red-100 text-red-600"
                  )}
                >
                  <HydrationSafe fallback={<div className="h-4 w-4 bg-current opacity-50 rounded-sm" />}>
                    <Icon icon="heroicons:ellipsis-vertical" className="h-4 w-4" />
                  </HydrationSafe>
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => onViewDetails?.(row.original)}
                  className="cursor-pointer"
                >
                  <HydrationSafe fallback={<div className="mr-2 h-4 w-4 bg-current opacity-50 rounded-sm" />}>
                    <Icon icon="heroicons:eye" className="mr-2 h-4 w-4" />
                  </HydrationSafe>
                  Lihat Detail
                </DropdownMenuItem>

                {canApprove && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onApprove?.(row.original)}
                      className="cursor-pointer text-green-600 focus:text-green-600"
                    >
                      <HydrationSafe fallback={<div className="mr-2 h-4 w-4 bg-current opacity-50 rounded-sm" />}>
                        <Icon icon="heroicons:check-circle" className="mr-2 h-4 w-4" />
                      </HydrationSafe>
                      Setujui Pengajuan
                    </DropdownMenuItem>
                  </>
                )}

                {canDistribute && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDistribute?.(row.original)}
                      className="cursor-pointer text-blue-600 focus:text-blue-600"
                    >
                      <HydrationSafe fallback={<div className="mr-2 h-4 w-4 bg-current opacity-50 rounded-sm" />}>
                        <Icon icon="heroicons:truck" className="mr-2 h-4 w-4" />
                      </HydrationSafe>
                      Distribusi Obat
                    </DropdownMenuItem>
                  </>
                )}

                {canEdit && onEdit && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onEdit(row.original)}
                      className="cursor-pointer"
                    >
                      <HydrationSafe fallback={<div className="mr-2 h-4 w-4 bg-current opacity-50 rounded-sm" />}>
                        <Icon icon="heroicons:pencil" className="mr-2 h-4 w-4" />
                      </HydrationSafe>
                      Edit
                    </DropdownMenuItem>
                  </>
                )}

                {permissions.canDelete && onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(row.original)}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <HydrationSafe fallback={<div className="mr-2 h-4 w-4 bg-current opacity-50 rounded-sm" />}>
                        <Icon icon="heroicons:trash" className="mr-2 h-4 w-4" />
                      </HydrationSafe>
                      Hapus
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
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
                    <Skeleton className="h-12 w-full" />
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
                className="cursor-pointer hover:bg-default-50"
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
                  <HydrationSafe fallback={<div className="h-12 w-12 bg-current opacity-50 rounded-sm mb-4" />}>
                    <Icon 
                      icon="heroicons:inbox" 
                      className="h-12 w-12 text-default-400 mb-4" 
                    />
                  </HydrationSafe>
                  <p className="text-default-500">Tidak ada transaksi ditemukan</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionTable;

// # END OF Transaction Table Component 