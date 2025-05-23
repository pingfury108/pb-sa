import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { pb } from "@/lib/pocketbase"
import { toast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react"

interface BatchUserCreateFormProps {
  onSuccess?: () => Promise<void>;
  collection?: string;
}

export function BatchUserCreateForm({ onSuccess, collection = 'baidu_edu_users' }: BatchUserCreateFormProps) {
  const [xufeiType, setXufeiType] = useState("day")
  const [days, setDays] = useState(1)
  
  // Update days value when renewal type changes
  useEffect(() => {
    switch (xufeiType) {
      case "day":
        setDays(1)
        break
      case "week":
        setDays(7)
        break
      case "month":
        setDays(30)
        break
      default:
        setDays(1)
    }
  }, [xufeiType])
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">批量添加用户</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>批量添加用户</SheetTitle>
          <SheetDescription>
            一次性创建多个百度教育用户
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="prefix">用户名前缀</Label>
            <Input id="prefix" placeholder="例如：edu" className="w-full" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startNum">起始序号</Label>
            <Input id="startNum" type="number" min="1" defaultValue="1" className="w-full" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="count">创建数量</Label>
            <Input id="count" type="number" min="1" defaultValue="1" className="w-full" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="remark">备注</Label>
            <Input id="remark" placeholder="所有批量创建的用户共用此备注" className="w-full" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="limit">配额</Label>
            <Input
              id="batch_limit"
              type="number"
              min="0"
              defaultValue="0"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="xufei_type">续费类型</Label>
            <Select 
              defaultValue="day"
              value={xufeiType}
              onValueChange={setXufeiType}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择续费类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">天</SelectItem>
                <SelectItem value="week">周</SelectItem>
                <SelectItem value="month">月</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="exp_time">过期时间</Label>
            <div className="flex gap-2">
              <Input
                id="batch_days"
                type="number"
                min="1"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="w-20"
              />
              <span>天</span>
            </div>
          </div>
          <Button
            onClick={async () => {
              const prefixInput = document.getElementById('prefix') as HTMLInputElement;
              const startNumInput = document.getElementById('startNum') as HTMLInputElement;
              const countInput = document.getElementById('count') as HTMLInputElement;
              const remarkInput = document.getElementById('remark') as HTMLInputElement;
              const limitInput = document.getElementById('batch_limit') as HTMLInputElement;

              const prefix = prefixInput.value.trim();
              const startNum = parseInt(startNumInput.value);
              const count = parseInt(countInput.value);
              const remark = remarkInput.value;
              const limit = parseInt(limitInput.value);

              if (!prefix) {
                toast({
                  title: "错误",
                  description: "请输入用户名前缀",
                  variant: "destructive",
                });
                return;
              }

              if (isNaN(count) || count < 1) {
                toast({
                  title: "错误",
                  description: "请输入有效的创建数量",
                  variant: "destructive",
                });
                return;
              }

              if (isNaN(startNum) || startNum < 1) {
                toast({
                  title: "错误",
                  description: "请输入有效的起始序号",
                  variant: "destructive",
                });
                return;
              }

              if (isNaN(days) || days < 1) {
                toast({
                  title: "错误",
                  description: "请输入有效的天数",
                  variant: "destructive",
                });
                return;
              }

              const expTime = new Date();
              expTime.setDate(expTime.getDate() + days);

              try {
                toast({
                  title: "处理中",
                  description: `正在创建 ${count} 个用户...`,
                });

                // Create users sequentially to avoid overwhelming the server
                for (let i = 0; i < count; i++) {
                  const currentNum = startNum + i;
                  const userName = `${prefix}-${currentNum}`;
                  await pb.collection(collection).create({
                    name: userName,
                    remark: remark,
                    exp_time: expTime.toISOString(),
                    limit: isNaN(limit) ? 0 : limit,
                    xufei_type: xufeiType,
                  });
                }

                toast({
                  title: "成功",
                  description: `成功创建 ${count} 个用户`,
                });

                // Set URL query param to the prefix and reload
                const params = new URLSearchParams();
                params.set("q", prefix);

                // First call onSuccess to ensure data is properly updated
                if (onSuccess) {
                  await onSuccess();
                }

                // Force reload with the new query parameter to show the newly created users
                window.location.href = `?${params.toString()}`;
              } catch (error) {
                console.error('Error creating batch users:', error);
                toast({
                  title: "错误",
                  description: "创建用户失败: " + (error instanceof Error ? error.message : String(error)),
                  variant: "destructive",
                });
              }
            }}
          >
            批量创建用户
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
