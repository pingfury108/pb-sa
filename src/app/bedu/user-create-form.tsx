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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react"

interface UserCreateFormProps {
  onSuccess?: () => Promise<void>;
  collection?: string;
}

export function UserCreateForm({ onSuccess, collection = 'baidu_edu_users' }: UserCreateFormProps) {
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
            <Label htmlFor="limit">配额</Label>
            <Input
              id="limit"
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
                id="days"
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
              const nameInput = document.getElementById('name') as HTMLInputElement;
              const remarkInput = document.getElementById('remark') as HTMLInputElement;
              const limitInput = document.getElementById('limit') as HTMLInputElement;
              const limit = parseInt(limitInput.value);

              if (isNaN(days) || days < 1) return;

              const expTime = new Date();
              expTime.setDate(expTime.getDate() + days);

              try {
                await pb.collection(collection).create({
                  name: nameInput.value,
                  remark: remarkInput.value,
                  exp_time: expTime.toISOString(),
                  limit: isNaN(limit) ? 0 : limit,
                  xufei_type: xufeiType,
                });

                // Set URL query param to new user's name and reload
                const params = new URLSearchParams();
                params.set("q", nameInput.value);

                // First call onSuccess to ensure data is properly updated
                if (onSuccess) {
                  await onSuccess();
                }

                // Force reload with the new query parameter to show the newly created user
                window.location.href = `?${params.toString()}`;
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
  )
}
