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

interface UserCreateFormProps {
  onSuccess?: () => Promise<void>;
}

export function UserCreateForm({ onSuccess }: UserCreateFormProps) {
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
                if (onSuccess) await onSuccess();
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
  )
}
