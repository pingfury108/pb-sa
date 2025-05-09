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
import type { User } from "./types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCallback, useEffect, useState } from "react"

interface UserRenewFormProps {
  user: User;
  collection?: string;
}

export function UserRenewForm({ user, collection = 'baidu_edu_users' }: UserRenewFormProps) {
  const [xufeiType, setXufeiType] = useState(user.xufei_type || "day")
  const [days, setDays] = useState(1)
  
  // Function to update expiration date display - memoized with useCallback
  const updateExpirationDate = useCallback((daysValue: number) => {
    const expDate = document.getElementById('exp-date');
    if (expDate && !isNaN(daysValue)) {
      const currentTime = new Date();
      const userExpTime = new Date(user.exp_time);
      const newExpTime = new Date(
        userExpTime > currentTime
          ? userExpTime.getTime() + daysValue * 24 * 60 * 60 * 1000
          : currentTime.getTime() + daysValue * 24 * 60 * 60 * 1000
      );
      expDate.textContent = newExpTime.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\//g, '-');
    }
  }, [user.exp_time]);
  
  // Update days value when renewal type changes
  useEffect(() => {
    let newDays = 1;
    switch (xufeiType) {
      case "day":
        newDays = 1
        break
      case "week":
        newDays = 7
        break
      case "month":
        newDays = 30
        break
      default:
        newDays = 1
    }
    
    setDays(newDays)
    // Update expiration date display
    updateExpirationDate(newDays)
  }, [xufeiType, updateExpirationDate])
  
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
            <Label htmlFor="limit">配额</Label>
            <Input
              id="limit"
              type="number"
              min="0"
              defaultValue={user.limit?.toString() || "0"}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="xufei_type">续费类型</Label>
            <Select 
              defaultValue={user.xufei_type || "day"} 
              onValueChange={setXufeiType}
              value={xufeiType}
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
            <Label htmlFor="days">续费天数</Label>
            <div className="flex gap-2">
              <Input
                id="days"
                type="number"
                min="1"
                value={days}
                className="w-20"
                onChange={(e) => {
                  const newDays = parseInt(e.target.value);
                  setDays(newDays);
                  updateExpirationDate(newDays);
                }}
              />
              <span>天</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>到期时间</Label>
            <div id="exp-date" className="text-sm">
              {new Date(user.exp_time).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              }).replace(/\//g, '-')}
            </div>
          </div>
          <Button
            onClick={async () => {
              const nameInput = document.getElementById('name') as HTMLInputElement;
              const remarkInput = document.getElementById('remark') as HTMLInputElement;
              const limitInput = document.getElementById('limit') as HTMLInputElement;
              const limit = parseInt(limitInput.value);

              if (isNaN(days) || days < 1) return;

              const currentTime = new Date();
              const userExpTime = new Date(user.exp_time);
              const expTime = new Date(
                userExpTime > currentTime
                  ? userExpTime.getTime() + days * 24 * 60 * 60 * 1000
                  : currentTime.getTime() + days * 24 * 60 * 60 * 1000
              );

              try {
                await pb.collection(collection).update(user.id, {
                  name: nameInput.value,
                  remark: remarkInput.value,
                  exp_time: expTime.toISOString(),
                  limit: isNaN(limit) ? 0 : limit,
                  xufei_type: xufeiType,
                });
                // Set URL query param to the updated user's name and reload
                const params = new URLSearchParams();
                params.set("q", nameInput.value);
                window.location.href = `?${params.toString()}`;
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
}
