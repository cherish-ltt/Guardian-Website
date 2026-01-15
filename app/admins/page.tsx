"use client"

import { useState, useEffect } from "react"
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
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getAdmins, createAdmin, deleteAdmin, ApiError, type AdminInfo } from "@/lib/api"

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [keyword, setKeyword] = useState("")
  const [status, setStatus] = useState<number | undefined>(undefined)

  const fetchAdmins = async () => {
    setLoading(true)
    try {
      const response = await getAdmins({
        page: currentPage,
        page_size: pageSize,
        keyword: keyword || undefined,
        status: status,
      })
      setAdmins(response.data.list)
      setTotal(response.data.total)
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
    fetchAdmins()
  }, [currentPage, pageSize, status])

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

  const totalPages = Math.ceil(total / pageSize)

  return (
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
                <Button>添加管理员</Button>
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
                      <TableHead>创建时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          加载中...
                        </TableCell>
                      </TableRow>
                    ) : admins.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
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
                            {new Date(admin.created_at).toLocaleString("zh-CN")}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
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
  )
}
