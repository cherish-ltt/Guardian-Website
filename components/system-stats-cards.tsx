"use client"

import { IconCpu, IconDatabase, IconDevices, IconNetwork } from "@tabler/icons-react"
import type { SystemInfo } from "@/lib/api"

interface SystemStatsCardsProps {
  data: SystemInfo[] | null
}

export function SystemStatsCards({ data }: SystemStatsCardsProps) {
  const latestData = data && data.length > 0 ? data[0] : null

  const formatBytes = (bytes: number | null | undefined): string => {
    if (!bytes || bytes === 0) return "0 B"
    const numBytes = typeof bytes === 'string' ? Number(bytes) : bytes
    if (isNaN(numBytes) || numBytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(numBytes) / Math.log(k))
    return `${(numBytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }

  const formatNetwork = (bytes: number | null | undefined): string => {
    if (!bytes || bytes === 0) return "0 Mb/s"
    const numBytes = (typeof bytes === 'string' ? Number(bytes) : bytes) / 100
    if (isNaN(numBytes) || numBytes === 0) return "0 Mb/s"
    const k = 1024
    const sizes = ["b/s", "Kb/s", "Mb/s", "Gb/s"]
    const i = Math.floor(Math.log(numBytes) / Math.log(k))
    return `${(numBytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }

  const formatNumber = (value: number | null | undefined, decimals = 1): string => {
    if (value === null || value === undefined || typeof value !== 'number' || isNaN(value)) return "0"
    return value.toFixed(decimals)
  }

  const getNumberValue = (value: number | null | undefined, defaultValue = 0): number => {
    if (value === null || value === undefined) return defaultValue
    const numValue = typeof value === 'string' ? Number(value) : value
    if (isNaN(numValue)) return defaultValue
    return numValue
  }

  const cpuLoad = getNumberValue(latestData?.cpu_total_load)
  const memoryUsed = getNumberValue(latestData?.memory_used)
  const memoryTotal = getNumberValue(latestData?.memory_total)
  const diskUsed = getNumberValue(latestData?.disk_used)
  const diskTotal = getNumberValue(latestData?.disk_total)
  const networkUpload = getNumberValue(latestData?.network_upload)
  const networkDownload = getNumberValue(latestData?.network_download)
  const cpuCount = getNumberValue(latestData?.cpu_count)

  const cards = [
    {
      title: "CPU 使用率",
      value: latestData ? `${formatNumber(cpuLoad)}%` : "暂无数据",
      description: `${cpuCount} 核 CPU`,
      icon: IconCpu,
      unit: "%",
      total: 100,
      current: cpuLoad,
    },
    {
      title: "内存使用率",
      value: latestData && memoryTotal > 0
        ? `${formatNumber((memoryUsed / memoryTotal) * 100)}%`
        : "暂无数据",
      description: `${formatBytes(memoryUsed)} / ${formatBytes(memoryTotal)}`,
      icon: IconDatabase,
      unit: "%",
      total: memoryTotal > 0 ? (memoryUsed / memoryTotal) * 100 : 0,
      current: memoryTotal > 0 ? (memoryUsed / memoryTotal) * 100 : 0,
    },
    {
      title: "硬盘使用率",
      value: latestData && diskTotal > 0
        ? `${formatNumber((diskUsed / diskTotal) * 100)}%`
        : "暂无数据",
      description: `${formatBytes(diskUsed)} / ${formatBytes(diskTotal)}`,
      icon: IconDevices,
      unit: "%",
      total: diskTotal > 0 ? (diskUsed / diskTotal) * 100 : 0,
      current: diskTotal > 0 ? (diskUsed / diskTotal) * 100 : 0,
    },
    {
      title: "网络流量",
      value: latestData ? "External" : "暂无数据",
      description: (
        <span className="flex flex-col gap-1 text-xs">
          <span>下载: {formatNetwork(networkDownload)}</span>
          <span>上传: {formatNetwork(networkUpload)}</span>
        </span>
      ),
      icon: IconNetwork,
      unit: "",
      total: 100,
      current: 0,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div
            key={index}
            className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </p>
                <p className="text-2xl font-bold tabular-nums">{card.value}</p>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
