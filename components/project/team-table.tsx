"use client"

import * as React from "react"
import Chart from "react-apexcharts";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, MoreVertical, SquarePen, Trash2 } from "lucide-react"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { colors } from "@/lib/colors"


export type TeamTableProps = {
  customer: {
    name: string;
    image: string;
    deg: string;
  },
  status: "progress" | "complete";
  time: string;
  chart: null;
  action:null;
}
const series = [
  {
    data: [800, 600, 1000, 800, 600, 1000, 800, 900],
  }
];
const options: any = {
  chart: {
    toolbar: {
      autoSelected: "pan",
      show: false,
    },
    offsetX: 0,
    offsetY: 0,
    zoom: {
      enabled: false,
    },
    sparkline: {
      enabled: true,
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "smooth",
    width: 2,
  },
  colors: [colors.primary],
  tooltip: {
    theme: "dark",
  },
  grid: {
    show: false,
    padding: {
      left: 0,
      right: 0,
    },
  },
  yaxis: {
    show: false,
  },
  fill: {
    type: "solid",
    opacity: [0.1],
  },
  legend: {
    theme: "dark",
    show: false,
  },
  xaxis: {
    low: 0,
    offsetX: 0,
    offsetY: 0,
    show: false,
    labels: {
      low: 0,
      offsetX: 0,
      show: false,
    },
    axisBorder: {
      low: 0,
      offsetX: 0,
      show: false,
    },
  },
};


export const columns: ColumnDef<TeamTableProps>[] = [
  {
    accessorKey: "customer",
    header: "ASSIGNEE",
    cell: ({ row }) => (
      <div className="flex items-center gap-5">
        <div className="flex-none">
          <div className="w-8 h-8">
            <Avatar>
              <AvatarImage src={row.original.customer.image}></AvatarImage>
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div className="flex-1 text-start text-default-600 capitalize whitespace-nowrap">
          {row.original.customer.name}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "status",
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="min-w-[140px] text-start">
          <div className="text-center mx-auto py-1">
            {row.getValue("status") === "progress" && (
              <span className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 bg-destructive rounded-full inline-block ring-4 ring-opacity-30 ring-destructive/50"></span>
                <span>In progress</span>
              </span>
            )}
            {row.getValue("status") === "complete" && (
              <span className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 bg-success rounded-full inline-block ring-4 ring-opacity-30 ring-success/50"></span>
                <span>Complete</span>
              </span>
            )}
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: "time",
    header: "Time",
    cell: ({ row }) => (
      <span className="whitespace-nowrap">{row.getValue("time")}</span>
    )
  },
  {
    accessorKey: "chart",
    header: "Chart",
    cell: ({ row }) => (
      <div>
        <Chart options={options} series={series} type="area" width="100%" height={48} />
      </div>
    )
  },

  {
    id: "actions",
    accessorKey: "action",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                 className="w-8 h-8 text-default-700 bg-transparent hover:bg-transparent ring-offset-transparent hover:ring-transparent"
              >
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4 cursor-pointer" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-0" align="end">
              <DropdownMenuItem className="p-2 border-b text-default-700 group focus:bg-default focus:text-primary-foreground rounded-none">
                <Eye className="w-4 h-4 me-1.5" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem className="p-2 border-b text-default-700 group focus:bg-default focus:text-primary-foreground rounded-none">
                <SquarePen className="w-4 h-4 me-1.5" />
                Edit</DropdownMenuItem>
              <DropdownMenuItem className="p-2 border-b bg-destructive/30 text-destructive group focus:bg-destructive focus:text-destructive-foreground rounded-none">
                <Trash2 className="w-4 h-4 me-1.5" />
                Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  }
]

const TeamTable = ({ data }: any) => {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 6,
  })

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination
    },
  })

  return (
    <div className="w-full overflow-x-auto">
      <Table className="overflow-hidden">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-default-200">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="last:text-end">
                  {header.isPlaceholder ? null : flexRender(
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
                className="h-[75px]"
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
                colSpan={columns.length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>


    </div>
  )
}

export default TeamTable;

