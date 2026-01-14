"use client"

import * as React from "react"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconSearch,
} from "@tabler/icons-react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { AuditLog } from "@/lib/types/audit-log"
import { getAuditLogs } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function AuditLogTable() {
  const [data, setData] = React.useState<AuditLog[]>([])
  const [loading, setLoading] = React.useState(true)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 20,
  })

  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: "created_at",
      header: "时间",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"))
        return <div className="whitespace-nowrap text-sm">{date.toLocaleString("zh-CN")}</div>
      },
    },
    {
      accessorKey: "username",
      header: "用户",
      cell: ({ row }) => (
        <div className="text-sm font-medium">{row.getValue("username") || "-"}</div>
      ),
    },
    {
      accessorKey: "action",
      header: "操作",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-normal">
          {row.getValue("action")}
        </Badge>
      ),
    },
    {
      accessorKey: "resource",
      header: "资源",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground max-w-xs truncate">
          {row.getValue("resource")}
        </div>
      ),
    },
    {
      accessorKey: "method",
      header: "方法",
      cell: ({ row }) => {
        const method = row.getValue("method") as string
        const methodColors: Record<string, string> = {
          GET: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
          POST: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
          PUT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
          DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        }
        return (
          <Badge
            variant="secondary"
            className={`font-mono text-xs ${methodColors[method] || "bg-gray-100 text-gray-800"}`}
          >
            {method}
          </Badge>
        )
      },
    },
    {
      accessorKey: "status_code",
      header: "状态码",
      cell: ({ row }) => {
        const statusCode = row.getValue("status_code") as number
        const isSuccess = statusCode >= 200 && statusCode < 300
        return (
          <Badge
            variant={isSuccess ? "default" : "destructive"}
            className="font-mono"
          >
            {statusCode}
          </Badge>
        )
      },
    },
    {
      accessorKey: "ip_address",
      header: "IP地址",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.getValue("ip_address") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "duration_ms",
      header: "耗时",
      cell: ({ row }) => {
        const duration = row.getValue("duration_ms") as number
        const getDurationColor = (ms: number) => {
          if (ms < 100) return "text-green-600 dark:text-green-400"
          if (ms < 500) return "text-yellow-600 dark:text-yellow-400"
          return "text-red-600 dark:text-red-400"
        }
        return (
          <div className={`text-sm font-mono ${getDurationColor(duration)}`}>
            {duration}ms
          </div>
        )
      },
    },
  ]

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
      pagination,
    },
  })

  React.useEffect(() => {
    const fetchData = async () => {
        setLoading(true)
        try {
          const USE_MOCK_DATA = true
          
          if (USE_MOCK_DATA) {
            const mockData: AuditLog[] = [
          {
            id: "1",
            trace_id: "trace-001",
            admin_id: "admin-001",
            username: "admin",
            action: "login",
            resource: "/auth/login",
            method: "POST",
            params: { username: "admin" },
            result: { success: true },
            status_code: 200,
            ip_address: "192.168.1.100",
            user_agent: "Mozilla/5.0",
            duration_ms: 45,
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            trace_id: "trace-002",
            admin_id: "admin-001",
            username: "admin",
            action: "create_admin",
            resource: "/admins",
            method: "POST",
            params: { username: "newadmin" },
            result: { success: true },
            status_code: 200,
            ip_address: "192.168.1.100",
            user_agent: "Mozilla/5.0",
            duration_ms: 120,
            created_at: new Date(Date.now() - 60000).toISOString(),
          },
          {
            id: "3",
            trace_id: "trace-003",
            admin_id: "admin-002",
            username: "user2",
            action: "logout",
            resource: "/auth/logout",
            method: "POST",
            params: {},
            result: { success: true },
            status_code: 200,
            ip_address: "192.168.1.101",
            user_agent: "Chrome/120.0",
            duration_ms: 30,
            created_at: new Date(Date.now() - 120000).toISOString(),
          },
        ]
        setData(mockData)
          } else {
            const response = await getAuditLogs({ 
              page: pagination.pageIndex + 1, 
              page_size: pagination.pageSize 
            })
            setData(response.list)
          }
      } catch (error) {
        console.error("Failed to fetch audit logs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [pagination.pageIndex, pagination.pageSize])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="搜索用户名、操作类型、资源..."
            value={(table.getColumn("username")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("username")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <div className="flex items-center gap-2">
            <IconSearch className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  加载中...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          共 {table.getFilteredRowModel().rows.length} 条记录
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">每页行数</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">转到首页</span>
              <IconChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">上一页</span>
              <IconChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center justify-center text-sm font-medium px-2">
              第 {table.getState().pagination.pageIndex + 1} 页，共{" "}
              {table.getPageCount()} 页
            </div>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">下一页</span>
              <IconChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">转到末页</span>
              <IconChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
