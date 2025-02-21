import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { Table } from "@tanstack/react-table"
import { User } from "../types"

interface ActionButtonsProps {
  table: Table<User>
  rowSelection: Record<string, boolean>
  onDelete: () => Promise<void>
}

export function ActionButtons({ table, rowSelection, onDelete }: ActionButtonsProps) {
  const selectedCount = Object.keys(rowSelection).length

  const copySelectedIds = () => {
    const selectedIds = table.getSelectedRowModel().rows.map(row => row.getValue('id') as string)
    navigator.clipboard.writeText(selectedIds.join('\n'))
    toast({
      description: `已复制 ${selectedIds.length} 个ID到剪贴板`,
    })
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-9"
        onClick={copySelectedIds}
        disabled={selectedCount === 0}
      >
        复制所选ID ({selectedCount})
      </Button>
      <Button
        variant="destructive"
        size="sm"
        className="h-9"
        onClick={async () => {
          if (!confirm(`确定要删除选中的 ${selectedCount} 条记录吗？`)) {
            return
          }
          await onDelete()
        }}
        disabled={selectedCount === 0}
      >
        删除所选 ({selectedCount})
      </Button>
    </div>
  )
}
