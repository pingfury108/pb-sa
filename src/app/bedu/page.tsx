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
              <div className="space-y-2">
                <Label htmlFor="name">用户名</Label>
                <Input
                  id="name"
                  defaultValue={user.name}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="remark">备注</Label>
                <Input
                  id="remark"
                  defaultValue={user.remark}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="days">续费天数</Label>
                <div className="flex gap-2">
                  <Input
                    id="days"
                    type="number"
                    min="1"
                    defaultValue="1"
                    className="w-20"
                  />
                  <span>天</span>
                </div>
              </div>
              <Button
                onClick={async () => {
                  const nameInput = document.getElementById('name') as HTMLInputElement;
                  const remarkInput = document.getElementById('remark') as HTMLInputElement;
                  const daysInput = document.getElementById('days') as HTMLInputElement;
                  const days = parseInt(daysInput.value);
                  
                  if (isNaN(days) || days < 1) return;
                  
                  const currentTime = new Date();
                  const userExpTime = new Date(user.exp_time);
                  const expTime = new Date(
                    userExpTime > currentTime
                      ? userExpTime.getTime() + days * 24 * 60 * 60 * 1000
                      : currentTime.getTime() + days * 24 * 60 * 60 * 1000
                  );
                  
                  try {
                    await pb.collection('baidu_edu_users').update(user.id, {
                      name: nameInput.value,
                      remark: remarkInput.value,
                      exp_time: expTime.toISOString(),
                    });
                    window.location.reload();
                  } catch (error) {
                    console.error('Error updating user:', error);
                  }
                }}
              >
                续费
              </Button>
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
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="搜索 ID/用户名/备注..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">添加用户</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>添加新用户</SheetTitle>
              <SheetDescription>
                创建新的百度教育用户
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">用户名</Label>
                <Input id="name" className="w-full" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="remark">备注</Label>
                <Input id="remark" className="w-full" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp_time">过期时间</Label>
                <div className="flex gap-2">
                  <Input
                    id="days"
                    type="number"
                    min="1"
                    defaultValue="1"
                    className="w-20"
                  />
                  <span>天</span>
                </div>
              </div>
              <Button
                onClick={async () => {
                  const nameInput = document.getElementById('name') as HTMLInputElement;
                  const remarkInput = document.getElementById('remark') as HTMLInputElement;
                  const daysInput = document.getElementById('days') as HTMLInputElement;
                  const days = parseInt(daysInput.value);
                  
                  if (isNaN(days) || days < 1) return;
                  
                  const expTime = new Date();
                  expTime.setDate(expTime.getDate() + days);
                  
                  try {
                    await pb.collection('baidu_edu_users').create({
                      name: nameInput.value,
                      remark: remarkInput.value,
                      exp_time: expTime.toISOString(),
                    });
                    window.location.reload();
                  } catch (error) {
                    console.error('Error creating user:', error);
                  }
                }}
              >
                创建用户
              </Button>
            </div>
          </SheetContent>
        </Sheet>
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
