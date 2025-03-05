"use client";

import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { pb } from "@/lib/pocketbase";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { UserCreateForm } from "./user-create-form";
import { BatchUserCreateForm } from "./batch-user-create-form";
import type { User } from "./types";
import { columns } from "./columns";
import { SearchInput } from "./components/search-input";

export default function BeduPage() {
  useEffect(() => {
    // Calculate and set header height for sticky positioning
    const headerElement = document.querySelector('.sticky:first-child');
    if (headerElement) {
      const height = headerElement.clientHeight;
      document.documentElement.style.setProperty('--header-height', `${height}px`);
    }
  }, []);
  const [users, setUsers] = useState<User[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [rowSelection, setRowSelection] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchAndUpdateUsers = async (page = currentPage, search = globalFilter) => {
    try {
      setIsLoading(true);
      const result = await pb
        .collection("baidu_edu_users")
        .getList(page, perPage, {
          sort: "-exp_time",
          ...(search
            ? {
                filter: `name ~ "${search}" || id ~ "${search}" || remark ~ "${search}"`,
              }
            : {}),
        });

      const mappedUsers = result.items.map((record) => ({
        id: record.id,
        name: record.name,
        remark: record.remark,
        created: record.created,
        updated: record.updated,
        exp_time: record.exp_time,
      }));

      setUsers(mappedUsers);
      setTotalPages(result.totalPages);
      setTotalItems(result.totalItems);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAndUpdateUsers(currentPage, globalFilter);
  }, [currentPage, globalFilter, perPage]);

  useEffect(() => {
    // Update header height on window resize
    const updateHeaderHeight = () => {
      const headerElement = document.querySelector('.sticky:first-child');
      if (headerElement) {
        const height = headerElement.clientHeight;
        document.documentElement.style.setProperty('--header-height', `${height}px`);
      }
    };

    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

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
      const searchValue = globalFilter.toLowerCase();
      return ["id", "name", "remark"].some((key) =>
        String(row.getValue(key)).toLowerCase().includes(searchValue),
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 50, // Set page size to match the backend
      },
    },
    });

  return (
  <div className="container mx-auto">
    <div className="sticky top-0 bg-background z-10 pb-2">
        <div className="flex items-center pt-4 pb-1 gap-4">
          <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-start">
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
              <div className="w-full md:w-1/2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2 md:mb-0">
                  <UserCreateForm onSuccess={() => {
                    setCurrentPage(1);
                    fetchAndUpdateUsers(1, globalFilter);
                  }} />
                  <BatchUserCreateForm onSuccess={() => {
                    setCurrentPage(1);
                    fetchAndUpdateUsers(1, globalFilter);
                  }} />

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 text-xs sm:text-sm flex-shrink-0"
                    onClick={() => {
                      const selectedIds = table.getSelectedRowModel().rows.map(row => row.getValue('id') as string)
                      navigator.clipboard.writeText(selectedIds.join('\n'))
                      toast({
                        description: `已复制 ${selectedIds.length} 个ID到剪贴板`,
                      })
                    }}
                    disabled={Object.keys(rowSelection).length === 0}
                  >
                    复制所选ID ({Object.keys(rowSelection).length})
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-9 text-xs sm:text-sm flex-shrink-0"
                    onClick={async () => {
                      const selectedCount = Object.keys(rowSelection).length;
                      if (!confirm(`确定要删除选中的 ${selectedCount} 条记录吗？`)) {
                        return;
                      }
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
                        fetchAndUpdateUsers(1, globalFilter);
                      } catch (error: unknown) {
                        console.error('Failed to delete users:', error);
                        alert('删除失败：' + (error instanceof Error ? error.message : String(error)));
                      }
                    }}
                    disabled={Object.keys(rowSelection).length === 0}
                  >
                    删除所选 ({Object.keys(rowSelection).length})
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="sticky top-[calc(var(--header-height,4rem))] mt-1 bg-background z-10 mb-1">
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
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
        </Table>
      </div>
      <div className="rounded-md border max-h-[calc(100vh-12rem)] overflow-y-auto">
        <Table>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const expTime = new Date(row.original.exp_time);
                const now = new Date();
                const timeDiff = expTime.getTime() - now.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

                const bgColor =
                  timeDiff < 0
                    ? "bg-red-200 hover:bg-red-300"
                    : daysDiff <= 3
                      ? "bg-orange-100 hover:bg-orange-200"
                      : daysDiff <= 7
                        ? "bg-yellow-100 hover:bg-yellow-200"
                        : "bg-green-100 hover:bg-green-200";

                return (
                  <TableRow key={row.id} className={bgColor}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
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
      <div className="flex justify-center gap-2 my-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          上一页
        </Button>
        <span className="flex items-center px-2 text-sm">
          第 {currentPage} 页 / 共 {totalPages} 页 (总计 {totalItems} 条)
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
          }
          disabled={currentPage === totalPages}
        >
          下一页
        </Button>
      </div>
    </div>
  );
}
