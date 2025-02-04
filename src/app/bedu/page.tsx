"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { pb } from "@/lib/pocketbase"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface User {
  id: string
  name: string
  remark: string
  created: string
  updated: string
  exp_time: string
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const id = row.getValue("id") as string
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0"
            onClick={() => {
              navigator.clipboard.writeText(id)
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <span>{id}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          用户名
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "exp_time",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          过期时间
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return new Date(row.getValue("exp_time")).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\//g, '-')
    },
  },
  {
    accessorKey: "remark",
    header: "备注",
  },
  {
    accessorKey: "created",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          创建时间
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return new Date(row.getValue("created")).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\//g, '-')
    },
  },
  {
    accessorKey: "updated",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          更新时间
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return new Date(row.getValue("updated")).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\//g, '-')
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original
      return (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              续费
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>续费用户</SheetTitle>
              <SheetDescription>
                修改用户 {user.name} 的信息
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
  
                <Label htmlFor="exp_time">过期时间</Label>
                <Input
                  id="exp_time"
                  type="datetime-local"
                  className="flex-1"
                  defaultValue={new Date(user.exp_time).toISOString().slice(0, 16)}
                  onChange={async (e) => {
                    try {
                      await pb.collection('baidu_edu_users').update(user.id, {
                        exp_time: new Date(e.target.value).toISOString(),
                      })
                      // Refresh the page to show updated data
                      window.location.reload()
                    } catch (error) {
                      console.error('Error updating user:', error)
                    }
                  }}
                />
            </div>
          </SheetContent>
        </Sheet>
      )
    },
  },
]

export default function BeduPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  useEffect(() => {
    async function fetchUsers() {
      try {
        const records = await pb.collection('baidu_edu_users').getList(1, 50)
        const mappedUsers = records.items.map(record => ({
          id: record.id,
          name: record.name,
          remark: record.remark,
          created: record.created,
          updated: record.updated,
          exp_time: record.exp_time
        }))
        setUsers(mappedUsers)
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      customGlobalFilter: (row, columnId, filterValue) => {
        const value = String(row.getValue(columnId)).toLowerCase()
        return value.includes(filterValue.toLowerCase())
      },
    },
    globalFilterFn: (row) => {
      const searchValue = globalFilter.toLowerCase()
      const id = String(row.getValue("id")).toLowerCase()
      const name = String(row.getValue("name")).toLowerCase()
      const remark = String(row.getValue("remark")).toLowerCase()
      
      return id.includes(searchValue) || 
             name.includes(searchValue) || 
             remark.includes(searchValue)
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  })

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center py-4">
        <Input
          placeholder="搜索 ID/用户名/备注..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
                  没有找到结果
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
