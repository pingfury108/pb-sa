import { Input } from "@/components/ui/input"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  totalResults?: number
}

export function SearchInput({ value, onChange, totalResults }: SearchInputProps) {
  return (
    <div className="w-full space-y-1">
      <Input
        placeholder="搜索 ID/用户名/备注..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full"
      />
      {value && totalResults !== undefined && (
        <div className="text-sm text-muted-foreground">
          找到 {totalResults} 条结果
        </div>
      )}
    </div>
  )
}
