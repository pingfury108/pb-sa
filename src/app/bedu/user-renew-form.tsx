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

interface UserRenewFormProps {
  user: User
}

export function UserRenewForm({ user }: UserRenewFormProps) {
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
                onChange={(e) => {
                  const days = parseInt(e.target.value);
                  const expDate = document.getElementById('exp-date');
                  if (expDate && !isNaN(days)) {
                    const currentTime = new Date();
                    const userExpTime = new Date(user.exp_time);
                    const newExpTime = new Date(
                      userExpTime > currentTime
                        ? userExpTime.getTime() + days * 24 * 60 * 60 * 1000
                        : currentTime.getTime() + days * 24 * 60 * 60 * 1000
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
}
