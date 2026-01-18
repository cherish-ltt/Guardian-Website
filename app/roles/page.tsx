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
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { getAccessToken, getRoles, createRole, updateRole, deleteRole, getRole, getPermissionsTree, assignPermissionsToRole, ApiError, type RoleInfo, type PermissionTreeNode } from "@/lib/api"

interface RoleFormData {
  code: string
  name: string
  description: string
  permission_ids?: string[]
}

function renderPermissionTree(
  nodes: PermissionTreeNode[],
  formData: RoleFormData,
  setFormData: React.Dispatch<React.SetStateAction<RoleFormData>>,
  formLoading: boolean,
  level: number = 0
) {
  return nodes.map((node) => (
    <div key={node.id} style={{ marginLeft: level * 20 }}>
      <div className="flex items-center space-x-2 mb-2">
        <Checkbox
          id={`permission-${node.id}`}
          checked={formData.permission_ids?.includes(node.id) || false}
          onCheckedChange={(checked) => {
            const newPermissionIds = checked
              ? [...(formData.permission_ids || []), node.id]
              : (formData.permission_ids || []).filter((id) => id !== node.id)
            setFormData({ ...formData, permission_ids: newPermissionIds })
          }}
          disabled={formLoading}
        />
        <label htmlFor={`permission-${node.id}`} className="text-sm flex-1">
          {node.name} ({node.code})
        </label>
      </div>
      {node.children && node.children.length > 0 && renderPermissionTree(
        node.children,
        formData,
        setFormData,
        formLoading,
        level + 1
      )}
    </div>
  ))
}

export default function RolesPage() {
  const router = useRouter()
  const [roles, setRoles] = useState<RoleInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [keyword, setKeyword] = useState("")
  const [permissionsTree, setPermissionsTree] = useState<PermissionTreeNode[]>([])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [editingRole, setEditingRole] = useState<RoleInfo | null>(null)

  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [viewingRole, setViewingRole] = useState<RoleInfo | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [formData, setFormData] = useState<RoleFormData>({
    code: "",
    name: "",
    description: "",
  })
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      router.push('/login')
      return
    }
  }, [router])

  const fetchPermissionsTree = async () => {
    try {
      const tree = await getPermissionsTree()
      setPermissionsTree(tree)
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || "获取权限树失败")
      } else {
        toast.error("发生未知错误，请稍后重试")
      }
    }
  }

  useEffect(() => {
    const token = getAccessToken()
    if (token) {
      fetchPermissionsTree()
    }
  }, [])

  const fetchRoles = async () => {
    setLoading(true)
    try {
      const response = await getRoles({
        page: currentPage,
        page_size: pageSize,
        keyword: keyword || undefined,
      })
      setRoles(response.list)
      setTotal(response.total)
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || "获取角色列表失败")
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
      fetchRoles()
    }
  }, [currentPage, pageSize, keyword])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchRoles()
  }

  const handleViewDetail = async (role: RoleInfo) => {
    setDetailDialogOpen(true)
    setDetailLoading(true)
    setViewingRole(null)

    try {
      const roleDetail = await getRole(role.id)
      setViewingRole(roleDetail)
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || "获取角色详情失败")
      } else {
        toast.error("发生未知错误，请稍后重试")
      }
    } finally {
      setDetailLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除角色 "${name}" 吗？`)) {
      return
    }

    try {
      await deleteRole(id)
      toast.success("删除成功")
      fetchRoles()
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
    setEditingRole(null)
    setFormData({
      code: "",
      name: "",
      description: "",
      permission_ids: [],
    })
    setDialogOpen(true)
  }

  const handleEdit = async (role: RoleInfo) => {
    setDialogMode("edit")
    setEditingRole(role)
    setFormLoading(true)

    try {
      const roleDetail = await getRole(role.id)
      const permissionIds = roleDetail.permissions?.map((p) => p.id) || []

      setFormData({
        code: roleDetail.code,
        name: roleDetail.name,
        description: roleDetail.description || "",
        permission_ids: permissionIds,
      })
      setDialogOpen(true)
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || "获取角色详情失败")
      } else {
        toast.error("发生未知错误，请稍后重试")
      }
    } finally {
      setFormLoading(false)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code) {
      toast.error("角色代码不能为空")
      return
    }

    if (!formData.name) {
      toast.error("角色名称不能为空")
      return
    }

    if (formData.code.length < 2) {
      toast.error("角色代码至少为 2 位")
      return
    }

    if (formData.name.length < 2) {
      toast.error("角色名称至少为 2 个字符")
      return
    }

    setFormLoading(true)
    try {
      if (dialogMode === "create") {
        await createRole({
          code: formData.code,
          name: formData.name,
          description: formData.description,
        })
        toast.success("创建成功")
      } else if (dialogMode === "edit" && editingRole) {
        await updateRole(editingRole.id, {
          code: formData.code,
          name: formData.name,
          description: formData.description,
        })

        if (formData.permission_ids) {
          await assignPermissionsToRole(editingRole.id, formData.permission_ids)
        }

        toast.success("更新成功")
      }

      setDialogOpen(false)
      setFormData({
        code: "",
        name: "",
        description: "",
        permission_ids: [],
      })
      fetchRoles()
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
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 px-4 py-4 lg:px-6 lg:py-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">角色管理</h1>
                  <Button onClick={handleCreate}>添加角色</Button>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="keyword">搜索</Label>
                    <Input
                      id="keyword"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="角色代码或名称"
                      className="w-48"
                    />
                    <Button onClick={handleSearch} disabled={loading}>
                      搜索
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>角色代码</TableHead>
                        <TableHead>角色名称</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            加载中...
                          </TableCell>
                        </TableRow>
                      ) : roles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            暂无数据
                          </TableCell>
                        </TableRow>
                      ) : (
                        roles.map((role) => (
                          <TableRow key={role.id}>
                            <TableCell className="font-medium">{role.code}</TableCell>
                            <TableCell>{role.name}</TableCell>
                            <TableCell>
                              <Badge variant={role.is_system ? "default" : "secondary"}>
                                {role.is_system ? "系统角色" : "自定义"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetail(role)}
                                >
                                  详情
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(role)}
                                >
                                  编辑
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(role.id, role.name)}
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
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>角色详情</DialogTitle>
            <DialogDescription>
              查看角色的完整信息和权限绑定关系
            </DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <div className="py-8 text-center">加载中...</div>
          ) : viewingRole ? (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">角色代码</Label>
                  <div className="font-medium">{viewingRole.code}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">角色名称</Label>
                  <div>{viewingRole.name}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">类型</Label>
                  <div>
                    <Badge variant={viewingRole.is_system ? "default" : "secondary"}>
                      {viewingRole.is_system ? "系统角色" : "自定义"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">描述</Label>
                  <div>{viewingRole.description || "-"}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">创建时间</Label>
                  <div>{new Date(viewingRole.created_at).toLocaleString("zh-CN")}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">更新时间</Label>
                  <div>{new Date(viewingRole.updated_at).toLocaleString("zh-CN")}</div>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground mb-2 block">绑定权限</Label>
                <div className="rounded-md border p-4 max-h-64 overflow-y-auto">
                  {viewingRole.permissions && viewingRole.permissions.length > 0 ? (
                    <div className="space-y-2">
                      {viewingRole.permissions.map((permission) => (
                        <div key={permission.id} className="text-sm">
                          {permission.name} ({permission.code})
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">暂无绑定权限</div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button onClick={() => setDetailDialogOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogMode === "create" ? "添加角色" : "编辑角色"}</DialogTitle>
          <DialogDescription>
            {dialogMode === "create" ? "请填写角色信息" : "请更新角色信息"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">角色代码 *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="请输入角色代码（如 ADMIN, USER）"
                required
                disabled={formLoading || (dialogMode === "edit")}
                maxLength={50}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">角色名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入角色名称"
                required
                disabled={formLoading}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请输入角色描述（可选）"
                disabled={formLoading}
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label>权限</Label>
              <div className="rounded-md border p-4 max-h-64 overflow-y-auto">
                {permissionsTree.length > 0 ? (
                  renderPermissionTree(permissionsTree, formData, setFormData, formLoading)
                ) : (
                  <div className="text-sm text-muted-foreground">暂无权限</div>
                )}
              </div>
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
