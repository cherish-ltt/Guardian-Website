"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { getAdmins, createAdmin, updateAdmin, deleteAdmin, getRoles, getAdmin, assignRolesToAdmin, ApiError, getAccessToken, type AdminInfo, type RoleInfo } from "@/lib/api"

interface AdminFormData {
  username: string
  password?: string
  is_super_admin: boolean
  status: number
  role_ids?: string[]
  permission_ids?: string[]
}

export default function AdminsPage() {
  const router = useRouter()
  const [admins, setAdmins] = useState<AdminInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [keyword, setKeyword] = useState("")
  const [status, setStatus] = useState<number | undefined>(undefined)
  const [roles, setRoles] = useState<RoleInfo[]>([])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [editingAdmin, setEditingAdmin] = useState<AdminInfo | null>(null)
  const [formData, setFormData] = useState<AdminFormData>({
    username: "",
    is_super_admin: false,
    status: 1,
    role_ids: [],
    permission_ids: [],
  })
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      router.push('/login')
      return
    }
  }, [router])

  const fetchAdmins = async () => {
    setLoading(true)
    try {
      const response = await getAdmins({
        page: currentPage,
        page_size: 20,
        keyword: keyword || undefined,
        status: status,
      })
      setAdmins(response.list)
      setTotal(response.total)
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || "获取管理员列表失败")
      } else {
        toast.error("发生未知错误，请稍后重试")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = getAccessToken()
    if (token) {
      fetchAdmins()
      fetchRoles()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, status])

  const fetchRoles = async () => {
    try {
      const response = await getRoles({
        page: 1,
        page_size: 1000,
      })
      setRoles(response.list)
    } catch (err) {
      console.error("获取角色列表失败", err)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchAdmins()
  }

  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`确定要删除管理员 "${username}" 吗？`)) {
      return
    }

    try {
      await deleteAdmin(id)
      toast.success("删除成功")
      fetchAdmins()
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || "删除失败")
      } else {
        toast.error("发生未知错误，请稍后重试")
      }
    }
  }

  const handleCreate = () => {
    setDialogMode("create")
    setEditingAdmin(null)
    setFormData({
      username: "",
      is_super_admin: false,
      status: 1,
      role_ids: [],
      permission_ids: [],
    })
    setDialogOpen(true)
  }

  const handleEdit = (admin: AdminInfo) => {
    setDialogMode("edit")
    setEditingAdmin(admin)
    setFormData({
      username: admin.username,
      is_super_admin: admin.is_super_admin,
      status: admin.status,
      role_ids: [],
      permission_ids: [],
    })
    setDialogOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.username) {
      toast.error("用户名不能为空")
      return
    }

    if (formData.username.length < 3) {
      toast.error("用户名长度至少为 3 位")
      return
    }

    setFormLoading(true)
    try {
      if (dialogMode === "create") {
        if (!formData.password) {
          toast.error("密码不能为空")
          setFormLoading(false)
          return
        }
        if (formData.password.length < 6) {
          toast.error("密码长度至少为 6 位")
          setFormLoading(false)
          return
        }
        await createAdmin({
          username: formData.username,
          password: formData.password,
          is_super_admin: formData.is_super_admin,
          role_ids: formData.role_ids,
        })
        toast.success("创建成功")
      } else if (dialogMode === "edit" && editingAdmin) {
        const updateData: {
          status: number
          role_ids?: string[]
          password?: string
        } = {
          status: formData.status,
        }
        if (formData.password) {
          if (formData.password.length < 6) {
            toast.error("密码长度至少为 6 位")
            setFormLoading(false)
            return
          }
          updateData.password = formData.password
        }
        await updateAdmin(editingAdmin.id, updateData)

        if (!formData.is_super_admin && formData.role_ids) {
          await assignRolesToAdmin(editingAdmin.id, formData.role_ids)
        }

        toast.success("更新成功")
      }

      setDialogOpen(false)
      setFormData({
        username: "",
        is_super_admin: false,
        status: 1,
        role_ids: [],
        permission_ids: [],
      })
      fetchAdmins()
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || (dialogMode === "create" ? "创建失败" : "更新失败"))
      } else {
        toast.error("发生未知错误，请稍后重试")
      }
    } finally {
      setFormLoading(false)
    }
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 px-4 py-4 lg:px-6 lg:py-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">管理员管理</h1>
                  <Button onClick={handleCreate}>添加管理员</Button>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="keyword">搜索</Label>
                    <Input
                      id="keyword"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="用户名"
                      className="w-48"
                    />
                    <Button onClick={handleSearch} disabled={loading}>
                      搜索
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="status">状态</Label>
                    <Select value={status?.toString()} onValueChange={(value) => setStatus(value ? Number(value) : undefined)}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="全部" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">正常</SelectItem>
                        <SelectItem value="0">禁用</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>用户名</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>最后登录</TableHead>
                        <TableHead>登录失败</TableHead>
                        <TableHead>锁定状态</TableHead>
                        <TableHead>创建时间</TableHead>
                        <TableHead>更新时间</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                       {loading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center">
                            加载中...
                          </TableCell>
                        </TableRow>
                      ) : admins.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center">
                            暂无数据
                          </TableCell>
                        </TableRow>
                      ) : (
                        admins.map((admin) => (
                          <TableRow key={admin.id}>
                            <TableCell className="font-medium">{admin.username}</TableCell>
                            <TableCell>
                              {admin.is_super_admin ? (
                                <Badge variant="default">超级管理员</Badge>
                              ) : (
                                <Badge variant="secondary">管理员</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={admin.status === 1 ? "default" : "destructive"}>
                                {admin.status === 1 ? "正常" : "禁用"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {admin.last_login_at
                                ? new Date(admin.last_login_at).toLocaleString("zh-CN")
                                : "未登录"}
                            </TableCell>
                            <TableCell>
                              {admin.login_attempts !== undefined ? admin.login_attempts : 0}
                            </TableCell>
                            <TableCell>
                              {admin.locked_until
                                ? new Date(admin.locked_until).toLocaleString("zh-CN")
                                : "未锁定"}
                            </TableCell>
                            <TableCell>
                              {new Date(admin.created_at).toLocaleString("zh-CN")}
                            </TableCell>
                            <TableCell>
                              {admin.updated_at
                                ? new Date(admin.updated_at).toLocaleString("zh-CN")
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(admin)}
                                >
                                  编辑
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(admin.id, admin.username)}
                                >
                                  删除
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    共 {total} 条记录，当前第 {currentPage} / {totalPages} 页
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={loading || currentPage <= 1}
                    >
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={loading || currentPage >= totalPages}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "create" ? "添加管理员" : "编辑管理员"}</DialogTitle>
            <DialogDescription>
              {dialogMode === "create" ? "请填写管理员信息" : "请更新管理员信息"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名 *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="请输入用户名（至少 3 位）"
                  required
                  disabled={formLoading || dialogMode === "edit"}
                />
              </div>

              {dialogMode === "create" && (
                <div className="space-y-2">
                  <Label htmlFor="password">密码 *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password || ""}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="请输入密码（至少 6 位）"
                    required
                    disabled={formLoading}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="is_super_admin">超级管理员</Label>
                <Switch
                  id="is_super_admin"
                  checked={formData.is_super_admin}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_super_admin: checked })}
                  disabled={formLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">状态</Label>
                <Select value={formData.status.toString()} onValueChange={(value) => setFormData({ ...formData, status: Number(value) })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">正常</SelectItem>
                    <SelectItem value="0">禁用</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>角色</Label>
                <div className="rounded-md border p-4 max-h-48 overflow-y-auto">
                  {roles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={formData.role_ids?.includes(role.id) || false}
                        onCheckedChange={(checked) => {
                          const newRoleIds = checked
                            ? [...(formData.role_ids || []), role.id]
                            : (formData.role_ids || []).filter((id) => id !== role.id)
                          setFormData({ ...formData, role_ids: newRoleIds })
                        }}
                        disabled={formLoading || formData.is_super_admin}
                      />
                      <label htmlFor={`role-${role.id}`} className="text-sm">
                        {role.name} ({role.code})
                      </label>
                    </div>
                  ))}
                  {roles.length === 0 && <div className="text-sm text-muted-foreground">暂无角色</div>}
                </div>
                {formData.is_super_admin && (
                  <p className="text-xs text-muted-foreground">超级管理员不需要分配角色</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={formLoading}
              >
                取消
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? (dialogMode === "create" ? "创建中..." : "更新中...") : (dialogMode === "create" ? "确认创建" : "确认更新")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
