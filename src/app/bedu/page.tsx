"use client"

import { useEffect, useState } from "react"
import { toast } from "@/hooks/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { pb } from "@/lib/pocketbase"
import { Button } from "@/components/ui/button"
import {
  Sheet,
} from "@/components/ui/sheet"

import { UserCreateForm } from "./user-create-form"
import type { User } from "./types"
import { columns } from "./columns"
import { SearchInput } from "./components/search-input"
import { ActionButtons } from "./components/action-buttons"

export default function BeduPage() {
  const [users, setUsers] = useState<User[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage] = useState(50)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [rowSelection, setRowSelection] = useState({})

  useEffect(() => {
    async function fetchUsers() {
      try {
        let result;
        
        if (globalFilter) {
          // When searching, fetch all matching results without pagination
          result = await pb.collection('baidu_edu_users').getList(1, 1000, {
            sort: '-exp_time',
            filter: `name ~ "${globalFilter}" || id ~ "${globalFilter}" || remark ~ "${globalFilter}"`,
          });
        } else {
          // Normal paginated fetch when not searching
          result = await pb.collection('baidu_edu_users').getList(currentPage, perPage, {
            sort: '-exp_time',
          });
        }
        
        const mappedUsers = result.items.map(record => ({
          id: record.id,
          name: record.name,
          remark: record.remark,
          created: record.created,
          updated: record.updated,
          exp_time: record.exp_time
        }));
        
        setUsers(mappedUsers);
        setTotalPages(result.totalPages);
        setTotalItems(result.totalItems);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }

    fetchUsers();
  }, [currentPage, globalFilter, perPage]);

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row) => {
      const searchValue = globalFilter.toLowerCase()
      return ['id', 'name', 'remark'].some(key => 
        String(row.getValue(key)).toLowerCase().includes(searchValue)
      )
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })



  return (
    <div className="container mx-auto">
      <div className="sticky top-0 bg-background z-10">
        <div className="flex items-center py-4 gap-4">
          <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="w-full md:w-1/2">
                <SearchInput
                  value={globalFilter}
                  onChange={(value) => {
                    setGlobalFilter(value);
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                  totalResults={table.getFilteredRowModel().rows.length}
                />
              </div>
              <div className="w-full md:w-1/2 flex justify-end items-center flex-nowrap gap-2">
                <Sheet>
                  <UserCreateForm onSuccess={async () => {
                    setCurrentPage(1);
                    try {
                      const result = await pb.collection('baidu_edu_users').getList(1, perPage, {
                        sort: '-exp_time',
                      });
                      const mappedUsers = result.items.map(record => ({
                        id: record.id,
                        name: record.name,
                        remark: record.remark,
                        created: record.created,
                        updated: record.updated,
                        exp_time: record.exp_time
                      }));
                      setUsers(mappedUsers);
                      setTotalPages(result.totalPages);
                      setTotalItems(result.totalItems);
                    } catch (error: unknown) {
                      console.error('Failed to fetch users:', error);
                      toast({
                        title: "Error",
                        description: "Failed to refresh user list: " + (error instanceof Error ? error.message : String(error)),
                        variant: "destructive",
                      });
                    }
                  }} />
                </Sheet>
                <ActionButtons
                  table={table}
                  rowSelection={rowSelection}
                  onDelete={async () => {
                    try {
                      const selectedIds = table.getSelectedRowModel().rows.map(row => row.getValue('id') as string);
                      await Promise.all(
                        selectedIds.map(id =>
                          pb.collection('baidu_edu_users').delete(id)
                        )
                      );
                      setRowSelection({});
                      // Refresh the list
                      setCurrentPage(1);
                      const result = await pb.collection('baidu_edu_users').getList(1, perPage, {
                        sort: '-exp_time',
                      });
                      const mappedUsers = result.items.map(record => ({
                        id: record.id,
                        name: record.name,
                        remark: record.remark,
                        created: record.created,
                        updated: record.updated,
                        exp_time: record.exp_time
                      }));
                      setUsers(mappedUsers);
                      setTotalPages(result.totalPages);
                      setTotalItems(result.totalItems);
                    } catch (error: unknown) {
                      console.error('Failed to delete users:', error);
                      alert('删除失败：' + (error instanceof Error ? error.message : String(error)));
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="sticky top-[68px] bg-background z-10">
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
          </Table>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const expTime = new Date(row.original.exp_time);
                const now = new Date();
                const timeDiff = expTime.getTime() - now.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                
                const bgColor = timeDiff < 0 ? 'bg-red-50 hover:bg-red-100' : 
                               daysDiff <= 3 ? 'bg-orange-50 hover:bg-orange-100' :
                               daysDiff <= 7 ? 'bg-yellow-50 hover:bg-yellow-100' :
                               'bg-green-50 hover:bg-green-100';

                return (
                  <TableRow key={row.id} className={bgColor}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
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
      <div className="flex justify-center gap-2 my-4">
        <Button
          variant="outline"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          上一页
        </Button>
        <span className="flex items-center px-4">
          第 {currentPage} 页 / 共 {totalPages} 页 (总计 {totalItems} 条)
        </span>
        <Button
          variant="outline"
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          下一页
        </Button>
      </div>
    </div>
  )
}
