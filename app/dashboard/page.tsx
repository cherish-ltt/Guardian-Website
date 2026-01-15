"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SystemCharts } from "@/components/system-charts"
import { SystemStatsCards } from "@/components/system-stats-cards"
import { SiteHeader } from "@/components/site-header"
import { toast } from "sonner"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import type { SystemInfo } from "@/lib/api"
import { getSystemInfo, ApiError } from "@/lib/api"

export default function Page() {
  const [systemData, setSystemData] = useState<SystemInfo[] | null>(null)
  const [timeRange, setTimeRange] = useState("20")
  const [isLoading, setIsLoading] = useState(true)

  const fetchSystemInfo = async () => {
    setIsLoading(true)
    try {
      let limit = 20
      if (timeRange === "20") {
        limit = 20
      } else if (timeRange === "50") {
        limit = 50
      } else if (timeRange === "100") {
        limit = 100
      }
      const data = await getSystemInfo(limit)
      setSystemData(data)
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || "获取系统信息失败")
      } else {
        toast.error("发生未知错误，请稍后重试")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSystemInfo()

    const interval = setInterval(() => {
      fetchSystemInfo()
    }, 60000)

    return () => clearInterval(interval)
  }, [timeRange])

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
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SystemStatsCards data={systemData} />
              <div className="mt-4">
                <SystemCharts data={systemData} onTimeRangeChange={setTimeRange} timeRange={timeRange} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
