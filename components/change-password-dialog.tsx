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
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { changePassword, ApiError } from "@/lib/api"
 
export function ChangePasswordDialog() {
   const [open, setOpen] = useState(false)
   const [password, setPassword] = useState("")
   const [confirmPassword, setConfirmPassword] = useState("")
   const [isLoading, setIsLoading] = useState(false)
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault()
 
     if (password !== confirmPassword) {
       toast.error("两次密码输入不一致")
       return
     }
 
     if (password.length < 6) {
       toast.error("密码长度至少为 6 位")
       return
     }
 
     setIsLoading(true)
     try {
       await changePassword(password)
       toast.success("密码修改成功")
       setOpen(false)
       setPassword("")
       setConfirmPassword("")
     } catch (err) {
       if (err instanceof ApiError) {
         toast.error(err.message || "密码修改失败")
       } else {
         toast.error("发生未知错误，请稍后重试")
       }
     } finally {
       setIsLoading(false)
     }
   }
 
   return (
     <Dialog open={open} onOpenChange={setOpen}>
       <Button variant="ghost" className="w-full justify-start" onClick={() => setOpen(true)}>
         修改密码
       </Button>
       <DialogContent>
         <DialogHeader>
           <DialogTitle>修改密码</DialogTitle>
           <DialogDescription>
             请输入您的新密码，密码长度至少为 6 位
           </DialogDescription>
         </DialogHeader>
         <form onSubmit={handleSubmit}>
           <div className="space-y-4 py-4">
             <div className="space-y-2">
               <Label htmlFor="password">新密码</Label>
               <Input
                 id="password"
                 type="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
                 disabled={isLoading}
                 placeholder="请输入新密码"
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
               onClick={() => setOpen(false)}
               disabled={isLoading}
             >
               取消
             </Button>
             <Button type="submit" disabled={isLoading}>
               {isLoading ? "修改中..." : "确认修改"}
             </Button>
           </DialogFooter>
         </form>
       </DialogContent>
     </Dialog>
   )
 }
