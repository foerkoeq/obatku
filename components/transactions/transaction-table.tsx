// # START OF Transaction Table Component - Data table for transaction management
// Purpose: Display transaction data with sorting, pagination, and role-based actions
// Props: data, onSort, onRowClick, onEdit, onDelete, onApprove, onDistribute, userRole, loading
// Returns: Interactive data table with responsive design
// Dependencies: Table UI components, TanStack Table, Transaction Status Indicator

"use client";

import { useState, useMemo } from "react";
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

// Ganti TableIcon component dengan:
const TableIcon: React.FC<{ icon: string; className?: string }> = ({ icon, className }) => (
  <span suppressHydrationWarning>
    <Icon icon={icon} className={className} />
  </span>
);

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

  // Helper function to generate BAST number
  const getBastNumber = (transaction: Transaction) => {
    // Generate BAST number from transaction ID
    return `BAST-${transaction.id.slice(-6).toUpperCase()}`;
  };

  // Helper function to format requested drugs
  const formatRequestedDrugs = (drugs: any[]) => {
    if (!drugs || drugs.length === 0) return "Belum ada";
    return drugs.map(d => `${d.drugName} (${d.requestedQuantity} ${d.unit})`).join(", ");
  };

  // Columns for Admin and Dinas
  const adminDinasColumns: ColumnDef<Transaction>[] = useMemo(() => [
    {
      accessorKey: "bastNumber",
      header: "No. BAST",
      cell: ({ row }) => (
        <div className="font-medium text-default-900 text-sm">
          {getBastNumber(row.original)}
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "letterNumber",
      header: "No Surat",
      cell: ({ row }) => (
          <div className="font-medium text-default-900 text-sm">
            {row.original.letterNumber}
        </div>
      ),
      size: 150,
    },
    {
      accessorKey: "farmerGroup.subDistrict",
      header: "Kecamatan",
      cell: ({ row }) => (
        <div className="text-sm text-default-700">
          {row.original.farmerGroup.subDistrict}
        </div>
      ),
      size: 120,
    },
    {
      accessorKey: "farmerGroup.name",
      header: "Poktan",
      cell: ({ row }) => (
        <div className="text-sm text-default-700 max-w-[150px] truncate" title={row.original.farmerGroup.name}>
            {row.original.farmerGroup.name}
          </div>
      ),
      size: 150,
    },
    {
      id: "requestedDrugs",
      header: "Permintaan Kandungan Obat",
      cell: ({ row }: { row: any }) => (
        <div className="text-xs text-default-600 max-w-[200px]">
          {row.original.submission.requestedDrugs?.length > 0 ? (
            <div className="truncate" title={formatRequestedDrugs(row.original.submission.requestedDrugs)}>
              {formatRequestedDrugs(row.original.submission.requestedDrugs)}
          </div>
          ) : (
            <span className="text-default-400">Belum ada</span>
          )}
        </div>
      ),
      size: 200,
    },
    {
      accessorKey: "farmingDetails.pestType",
      header: "OPT",
      cell: ({ row }) => (
        <div className="text-xs text-default-600 max-w-[150px]">
            {row.original.farmingDetails.pestType.slice(0, 2).join(", ")}
            {row.original.farmingDetails.pestType.length > 2 && (
            <span className="text-default-400"> +{row.original.farmingDetails.pestType.length - 2}</span>
            )}
        </div>
      ),
      size: 150,
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
                <TableIcon icon="heroicons:exclamation-triangle" className="h-3 w-3 mr-1" />
                Butuh Tindakan
              </Badge>
            )}
          </div>
        );
      },
      size: 120,
    },
    {
      id: "actions",
      header: "Aksi",
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
                  <TableIcon icon="heroicons:ellipsis-vertical" className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => onViewDetails?.(row.original)}
                  className="cursor-pointer"
                >
                  <TableIcon icon="heroicons:eye" className="mr-2 h-4 w-4" />
                  Lihat Detail
                </DropdownMenuItem>

                {canApprove && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onApprove?.(row.original)}
                      className="cursor-pointer text-green-600 focus:text-green-600"
                    >
                      <TableIcon icon="heroicons:check-circle" className="mr-2 h-4 w-4" />
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
                      <TableIcon icon="heroicons:truck" className="mr-2 h-4 w-4" />
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
                      <TableIcon icon="heroicons:pencil" className="mr-2 h-4 w-4" />
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
                      <TableIcon icon="heroicons:trash" className="mr-2 h-4 w-4" />
                      Hapus
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      size: 80,
    },
  ], [userRole, permissions, onViewDetails, onApprove, onDistribute, onEdit, onDelete]);

  // Columns for PPL and POPT
  const pplPoptColumns: ColumnDef<Transaction>[] = useMemo(() => [
    {
      accessorKey: "letterNumber",
      header: "No Surat",
      cell: ({ row }) => (
        <div className="font-medium text-default-900 text-sm">
          {row.original.letterNumber}
        </div>
      ),
      size: 150,
    },
    {
      accessorKey: "farmerGroup.village",
      header: "Desa",
      cell: ({ row }) => (
        <div className="text-sm text-default-700">
          {row.original.farmerGroup.village}
        </div>
      ),
      size: 120,
    },
    {
      accessorKey: "farmerGroup.name",
      header: "Nama Kelompok Tani",
      cell: ({ row }) => (
        <div className="text-sm text-default-700 max-w-[180px] truncate" title={row.original.farmerGroup.name}>
          {row.original.farmerGroup.name}
        </div>
      ),
      size: 180,
    },
    {
      accessorKey: "farmingDetails.pestType",
      header: "OPT",
      cell: ({ row }) => (
        <div className="text-xs text-default-600 max-w-[150px]">
          {row.original.farmingDetails.pestType.slice(0, 2).join(", ")}
          {row.original.farmingDetails.pestType.length > 2 && (
            <span className="text-default-400"> +{row.original.farmingDetails.pestType.length - 2}</span>
          )}
        </div>
      ),
      size: 150,
    },
    {
      accessorKey: "farmingDetails.affectedArea",
      header: "Luas Lahan Terserang (ha)",
      cell: ({ row }) => (
        <div className="text-sm text-default-700">
          {row.original.farmingDetails.affectedArea} ha
        </div>
      ),
      size: 150,
    },
    {
      id: "requestedDrugs",
      header: "Permintaan Obat",
      cell: ({ row }: { row: any }) => (
        <div className="text-xs text-default-600 max-w-[200px]">
          {row.original.submission.requestedDrugs?.length > 0 ? (
            <div className="truncate" title={formatRequestedDrugs(row.original.submission.requestedDrugs)}>
              {formatRequestedDrugs(row.original.submission.requestedDrugs)}
            </div>
          ) : (
            <span className="text-default-400">Belum ada</span>
          )}
        </div>
      ),
      size: 200,
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
                <TableIcon icon="heroicons:exclamation-triangle" className="h-3 w-3 mr-1" />
                Butuh Tindakan
              </Badge>
            )}
          </div>
        );
      },
      size: 120,
    },
    {
      id: "actions",
      header: "Aksi",
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
                  <TableIcon icon="heroicons:ellipsis-vertical" className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => onViewDetails?.(row.original)}
                  className="cursor-pointer"
                >
                  <TableIcon icon="heroicons:eye" className="mr-2 h-4 w-4" />
                  Lihat Detail
                </DropdownMenuItem>

                {canApprove && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onApprove?.(row.original)}
                      className="cursor-pointer text-green-600 focus:text-green-600"
                    >
                      <TableIcon icon="heroicons:check-circle" className="mr-2 h-4 w-4" />
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
                      <TableIcon icon="heroicons:truck" className="mr-2 h-4 w-4" />
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
                      <TableIcon icon="heroicons:pencil" className="mr-2 h-4 w-4" />
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
                      <TableIcon icon="heroicons:trash" className="mr-2 h-4 w-4" />
                      Hapus
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      size: 80,
    },
  ], [userRole, permissions, onViewDetails, onApprove, onDistribute, onEdit, onDelete]);

  // Select columns based on role
  const columns: ColumnDef<Transaction>[] = useMemo(() => {
    if (userRole === 'admin' || userRole === 'dinas') {
      return adminDinasColumns;
    } else {
      return pplPoptColumns;
    }
  }, [userRole, adminDinasColumns, pplPoptColumns]);

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
    <div className={cn("w-full overflow-x-auto", className)}>
      <div className="inline-block min-w-full align-middle">
        <Table className="w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id} 
                    className="font-medium whitespace-nowrap px-4 py-3 text-left"
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
                  className="cursor-pointer hover:bg-default-50"
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id} 
                      className="py-3 px-4"
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
                    <TableIcon 
                      icon="heroicons:inbox" 
                      className="h-12 w-12 text-default-400 mb-4" 
                    />
                    <p className="text-default-500">Tidak ada transaksi ditemukan</p>
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

export default TransactionTable;

// # END OF Transaction Table Component