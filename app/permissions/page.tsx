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
import { toast } from "sonner"
import { getAccessToken, getPermissions, createPermission, updatePermission, deletePermission, ApiError, type PermissionInfo } from "@/lib/api"

interface PermissionFormData {
  code: string
  name: string
  description: string
  resource_type: string
  http_method: string
  resource_path: string
  sort_order?: number
}

export default function PermissionsPage() {
  const router = useRouter()
  const [permissions, setPermissions] = useState<PermissionInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [keyword, setKeyword] = useState("")
  const [resourceType, setResourceType] = useState<string>("")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [editingPermission, setEditingPermission] = useState<PermissionInfo | null>(null)
  const [formData, setFormData] = useState<PermissionFormData>({
    code: "",
    name: "",
    description: "",
    resource_type: "",
    http_method: "",
    resource_path: "",
  })
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      router.push('/login')
      return
    }
  }, [router])

  const fetchPermissions = async () => {
    setLoading(true)
    try {
      const response = await getPermissions({
        page: currentPage,
        page_size: pageSize,
        keyword: keyword || undefined,
        resource_type: resourceType || undefined,
      })
      setPermissions(response.list)
      setTotal(response.total)
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || "获取权限列表失败")
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
      fetchPermissions()
    }
  }, [currentPage, pageSize, keyword, resourceType])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchPermissions()
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除权限 "${name}" 吗？`)) {
      return
    }

    try {
      await deletePermission(id)
      toast.success("删除成功")
      fetchPermissions()
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
    setEditingPermission(null)
    setFormData({
      code: "",
      name: "",
      description: "",
      resource_type: "",
      http_method: "",
      resource_path: "",
    })
    setDialogOpen(true)
  }

  const handleEdit = (permission: PermissionInfo) => {
    setDialogMode("edit")
    setEditingPermission(permission)
    setFormData({
      code: permission.code,
      name: permission.name,
      description: permission.description || "",
      resource_type: permission.resource_type || "",
      http_method: permission.http_method || "",
      resource_path: permission.resource_path || "",
    })
    setDialogOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code) {
      toast.error("权限代码不能为空")
      return
    }

    if (!formData.name) {
      toast.error("权限名称不能为空")
      return
    }

    if (formData.code.length < 2) {
      toast.error("权限代码至少为 2 位")
      return
    }

    if (formData.name.length < 2) {
      toast.error("权限名称至少为 2 个字符")
      return
    }

    if (formData.resource_type && formData.resource_type !== "api" && formData.resource_type !== "menu" && formData.resource_type !== "button") {
      toast.error("资源类型必须是 api、menu 或 button")
      return
    }

    setFormLoading(true)
    try {
      if (dialogMode === "create") {
        await createPermission({
          code: formData.code,
          name: formData.name,
          description: formData.description,
          resource_type: formData.resource_type,
          http_method: formData.http_method,
          resource_path: formData.resource_path,
        })
        toast.success("创建成功")
      } else if (dialogMode === "edit" && editingPermission) {
        const updateData: any = {
          name: formData.name,
          description: formData.description,
          resource_type: formData.resource_type,
          http_method: formData.http_method,
          resource_path: formData.resource_path,
        }
        if (formData.sort_order !== undefined) {
          updateData.sort_order = formData.sort_order
        }
        await updatePermission(editingPermission.id, updateData)
        toast.success("更新成功")
      }

      setDialogOpen(false)
      setFormData({
        code: "",
        name: "",
        description: "",
        resource_type: "",
        http_method: "",
        resource_path: "",
      })
      fetchPermissions()
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

  const totalPages = Math.ceil(total / pageSize)

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
                  <h1 className="text-2xl font-bold">权限管理</h1>
                  <Button onClick={handleCreate}>添加权限</Button>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="keyword">搜索</Label>
                    <Input
                      id="keyword"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="权限名称或代码"
                      className="w-48"
                    />
                    <Button onClick={handleSearch} disabled={loading}>
                      搜索
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="resourceType">资源类型</Label>
                    <Select value={resourceType || "all"} onValueChange={(value) => setResourceType(value === "all" ? "" : value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="全部" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部</SelectItem>
                        <SelectItem value="api">API</SelectItem>
                        <SelectItem value="menu">菜单</SelectItem>
                        <SelectItem value="button">按钮</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>权限代码</TableHead>
                        <TableHead>权限名称</TableHead>
                        <TableHead>描述</TableHead>
                        <TableHead>资源类型</TableHead>
                        <TableHead>HTTP 方法</TableHead>
                        <TableHead>资源路径</TableHead>
                        <TableHead>排序</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>创建时间</TableHead>
                        <TableHead>更新时间</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={11} className="text-center">
                            加载中...
                          </TableCell>
                        </TableRow>
                      ) : permissions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={11} className="text-center">
                            暂无数据
                          </TableCell>
                        </TableRow>
                      ) : (
                        permissions.map((permission) => (
                          <TableRow key={permission.id}>
                            <TableCell className="font-medium">{permission.code}</TableCell>
                            <TableCell>{permission.name}</TableCell>
                            <TableCell>{permission.description || "-"}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{permission.resource_type || "-"}</Badge>
                            </TableCell>
                            <TableCell>{permission.http_method || "-"}</TableCell>
                            <TableCell>{permission.resource_path || "-"}</TableCell>
                            <TableCell>{permission.sort_order ?? "-"}</TableCell>
                            <TableCell>
                              <Badge variant={permission.is_system ? "default" : "secondary"}>
                                {permission.is_system ? "系统" : "自定义"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(permission.created_at).toLocaleString("zh-CN")}
                            </TableCell>
                            <TableCell>
                              {new Date(permission.updated_at).toLocaleString("zh-CN")}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(permission)}
                                >
                                  编辑
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(permission.id, permission.name)}
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
            <DialogTitle>{dialogMode === "create" ? "添加权限" : "编辑权限"}</DialogTitle>
            <DialogDescription>
              {dialogMode === "create" ? "请填写权限信息" : "请更新权限信息"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">权限代码 *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="请输入权限代码（如 API_USER_CREATE）"
                  required
                  disabled={formLoading || (dialogMode === "edit")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">权限名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入权限名称"
                  required
                  disabled={formLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="请输入权限描述（可选）"
                  disabled={formLoading}
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resource_type">资源类型</Label>
                <Select value={formData.resource_type} onValueChange={(value) => setFormData({ ...formData, resource_type: value })}>
                  <SelectTrigger id="resource_type">
                    <SelectValue placeholder="请选择资源类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="menu">菜单</SelectItem>
                    <SelectItem value="button">按钮</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.resource_type === "api" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="http_method">HTTP 方法</Label>
                    <Select value={formData.http_method} onValueChange={(value) => setFormData({ ...formData, http_method: value })}>
                      <SelectTrigger id="http_method">
                        <SelectValue placeholder="请选择HTTP方法" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resource_path">资源路径</Label>
                    <Input
                      id="resource_path"
                      value={formData.resource_path}
                      onChange={(e) => setFormData({ ...formData, resource_path: e.target.value })}
                      placeholder="例如: /api/v1/users"
                      disabled={formLoading}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="sort_order">排序（可选）</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order || ""}
                  onChange={(e) => setFormData({ ...formData, sort_order: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="请输入排序值，数字越小越靠前"
                  disabled={formLoading}
                />
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
