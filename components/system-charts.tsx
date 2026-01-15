"use client"

import * as React from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import type { SystemInfo } from "@/lib/api"

interface SystemChartsProps {
  data: SystemInfo[] | null
  onTimeRangeChange?: (timeRange: string) => void
  timeRange?: string
}

export function SystemCharts({ data, onTimeRangeChange, timeRange: propTimeRange }: SystemChartsProps) {
  const isMobile = useIsMobile()
  const [internalTimeRange, setInternalTimeRange] = React.useState(propTimeRange || "1h")

  const handleTimeRangeChange = (value: string) => {
    setInternalTimeRange(value)
    onTimeRangeChange?.(value)
  }

  const getNumberValue = (value: number | null | undefined | string, defaultValue = 0): number => {
    if (value === null || value === undefined) return defaultValue
    const numValue = typeof value === 'string' ? Number(value) : value
    if (typeof numValue !== 'number' || isNaN(numValue)) return defaultValue
    return numValue
  }

  const formatBytes = (bytes: number | null | undefined | string): string => {
    const numBytes = getNumberValue(bytes)
    if (numBytes === 0) return "0"
    const k = 1024
    const sizes = ["", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(numBytes) / Math.log(k))
    return `${(numBytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }

  const formatNetwork = (bytes: number | null | undefined | string): string => {
    const numBytes = getNumberValue(bytes)
    if (numBytes === 0) return "0"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(numBytes) / Math.log(k))
    return `${(numBytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}/s`
  }

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getChartData = () => {
    if (!data || data.length === 0) {
      return []
    }

    return [...data].reverse().map((item) => {
      const cpuTotalLoad = getNumberValue(item.cpu_total_load)
      const memoryUsed = getNumberValue(item.memory_used)
      const memoryTotal = getNumberValue(item.memory_total)
      const diskUsed = getNumberValue(item.disk_used)
      const diskTotal = getNumberValue(item.disk_total)
      const networkUpload = getNumberValue(item.network_upload)
      const networkDownload = getNumberValue(item.network_download)

      return {
        time: formatTime(item.created_at),
        cpu: Number(cpuTotalLoad.toFixed(2)),
        memoryPercent: Number((memoryTotal > 0 ? (memoryUsed / memoryTotal) * 100 : 0).toFixed(2)),
        diskPercent: Number((diskTotal > 0 ? (diskUsed / diskTotal) * 100 : 0).toFixed(2)),
        networkUpload,
        networkDownload,
      }
    })
  }

  const chartData = getChartData()

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-md">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const chartConfigs = [
    {
      title: "CPU 使用率历史",
      dataKey: "cpu",
      color: "#3b82f6",
      unit: "%",
      yAxisDomain: [0, 100] as [number, number],
    },
    {
      title: "内存使用率历史",
      dataKey: "memoryPercent",
      color: "#10b981",
      unit: "%",
      yAxisDomain: [0, 100] as [number, number],
    },
    {
      title: "硬盘使用率历史",
      dataKey: "diskPercent",
      color: "#f59e0b",
      unit: "%",
      yAxisDomain: [0, 100] as [number, number],
    },
    {
      title: "网络流量历史",
      dataKey: "network",
      color: "#8b5cf6",
      unit: "",
      yAxisDomain: undefined as any,
      isNetwork: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 lg:grid-cols-2">
      {chartConfigs.map((config, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {config.title}
            </CardTitle>
            <ToggleGroup
              type="single"
              value={internalTimeRange}
              onValueChange={handleTimeRangeChange}
              variant="outline"
              className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
            >
              <ToggleGroupItem value="1h">1 小时</ToggleGroupItem>
              <ToggleGroupItem value="12h">12 小时</ToggleGroupItem>
              <ToggleGroupItem value="24h">24 小时</ToggleGroupItem>
            </ToggleGroup>
            <Select value={internalTimeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger
                className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                size="sm"
                aria-label="选择时间范围"
              >
                <SelectValue placeholder="1 小时" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="1h" className="rounded-lg">
                  1 小时
                </SelectItem>
                <SelectItem value="12h" className="rounded-lg">
                  12 小时
                </SelectItem>
                <SelectItem value="24h" className="rounded-lg">
                  24 小时
                </SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="time"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      domain={config.yAxisDomain}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {config.isNetwork ? (
                      <>
                        <Line
                          type="monotone"
                          dataKey="networkDownload"
                          stroke={config.color}
                          strokeWidth={2}
                          dot={false}
                          name={`下载 ${formatNetwork(chartData[0]?.networkDownload || "0")}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="networkUpload"
                          stroke="#ef4444"
                          strokeWidth={2}
                          dot={false}
                          name={`上传 ${formatNetwork(chartData[0]?.networkUpload || "0")}`}
                        />
                      </>
                    ) : (
                      <Line
                        type="monotone"
                        dataKey={config.dataKey}
                        stroke={config.color}
                        strokeWidth={2}
                        dot={false}
                        name={`${config.unit}`}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  暂无数据
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
