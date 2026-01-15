"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>重置密码</CardTitle>
          <CardDescription>
            通过 2FA 验证码重置密码，无需登录
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
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
              <Input
                id="twoFaCode"
                value={twoFaCode}
                onChange={(e) => setTwoFaCode(e.target.value)}
                required
                disabled={isLoading}
                placeholder="请输入 6 位数字验证码"
                maxLength={6}
              />
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
              />
            </div>
            <br></br>
          </CardContent>
          <CardFooter className="flex flex-col-reverse gap-2">
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
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
