"use client"
 
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { resetPassword, ApiError } from "@/lib/api"
 
export function ResetPasswordDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [username, setUsername] = useState("")
  const [twoFaCode, setTwoFaCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
 
    if (!username || !twoFaCode || !newPassword) {
      toast.error("请填写所有字段")
      return
    }
 
    if (newPassword !== confirmPassword) {
      toast.error("两次密码输入不一致")
      return
    }
 
    if (newPassword.length < 6) {
      toast.error("密码长度至少为 6 位")
      return
    }
 
    if (twoFaCode.length !== 6) {
      toast.error("2FA 验证码必须是 6 位数字")
      return
    }
 
    setIsLoading(true)
    try {
      await resetPassword(username, twoFaCode, newPassword)
      toast.success("密码重置成功")
      onClose()
      setUsername("")
      setTwoFaCode("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || "密码重置失败")
      } else {
        toast.error("发生未知错误，请稍后重试")
      }
    } finally {
      setIsLoading(false)
    }
  }
 
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>重置密码</DialogTitle>
          <DialogDescription>
            通过 2FA 验证码重置密码，无需登录
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                placeholder="请输入用户名"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twoFaCode">2FA 验证码</Label>
              <InputOTP
                maxLength={6}
                value={twoFaCode}
                onChange={setTwoFaCode}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                </InputOTPGroup>
                <InputOTPGroup>
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
                <InputOTPGroup>
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <p className="text-sm text-muted-foreground mt-2">请输入 6 位数字验证码</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">新密码</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="请输入新密码（至少 6 位）"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="请再次输入新密码"
                autoComplete="new-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "重置中..." : "确认重置"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
 }
