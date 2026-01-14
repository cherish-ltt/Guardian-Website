"use client"
 
import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

type UsageStatus = "normal" | "medium" | "high" | "critical"

function getUsageStatus(percentage: number): UsageStatus {
  if (percentage >= 90) return "critical"
  if (percentage >= 70) return "high"
  if (percentage >= 50) return "medium"
  return "normal"
}

function getStatusColor(status: UsageStatus): string {
  const normalColorMap = {
    cpu: "hsl(221.2 83.2% 53.3%)",
    memory: "hsl(142.1 76.2% 36.3%)",
    disk: "hsl(47.9 95.8% 53.1%)",
  }
  
  if (status === "normal") {
    return normalColorMap.cpu
  }
  if (status === "medium") {
    return "hsl(48 90% 60%)"
  }
  if (status === "high") {
    return "hsl(25.4 95.0% 53.1%)"
  }
  return "hsl(0 84.2% 60.2%)"
}
 
const generateTimeLabels = (count: number) => {
  const labels: string[] = []
  const now = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 5 * 60 * 1000)
    labels.push(time.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }))
  }
  return labels
}
 
const cpuData = generateTimeLabels(24).map((time, index) => ({
  time,
  cpu: 35 + Math.random() * 30,
}))
 
const memoryData = generateTimeLabels(24).map((time, index) => ({
  time,
  memory: 11 + Math.random() * 4,
}))
 
const diskData = generateTimeLabels(24).map((time) => ({
  time,
  disk: 440 + Math.random() * 40,
}))
 
const bandwidthData = generateTimeLabels(24).map((time, index) => ({
  time,
  upload: 70 + Math.random() * 20,
  download: 30 + Math.random() * 15,
}))
 
export function ResourceCharts() {
  const cpuUsage = 45.2
  const cpuStatus = getUsageStatus(cpuUsage)
  const cpuColor = getStatusColor(cpuStatus)
  
  const memoryUsage = 75.3
  const memoryStatus = getUsageStatus(memoryUsage)
  const memoryColor = getStatusColor(memoryStatus)
  
  const diskUsage = 90.0
  const diskStatus = getUsageStatus(diskUsage)
  const diskColor = getStatusColor(diskStatus)
  
  const cpuChartConfig = {
    cpu: {
      label: "CPU 负载 (%)",
      color: cpuColor,
    },
  } satisfies ChartConfig
 
  const memoryChartConfig = {
    memory: {
      label: "内存 (GB)",
      color: memoryColor,
    },
  } satisfies ChartConfig
 
  const diskChartConfig = {
    disk: {
      label: "硬盘 (GB)",
      color: diskColor,
    },
  } satisfies ChartConfig
 
  const bandwidthChartConfig = {
    upload: {
      label: "上传 (MB/s)",
      color: "hsl(142.1 76.2% 36.3%)",
    },
    download: {
      label: "下载 (MB/s)",
      color: "hsl(221.2 83.2% 53.3%)",
    },
  } satisfies ChartConfig
 
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6">
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>CPU 负载</CardTitle>
          <CardDescription>每5分钟采样</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={cpuChartConfig} className="aspect-auto h-[200px] w-full">
            <AreaChart data={cpuData}>
              <defs>
                <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={cpuColor} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={cpuColor} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => value.slice(0, 5)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                dataKey="cpu"
                type="natural"
                fill="url(#cpuGradient)"
                stroke={cpuColor}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardTitle>内存占用</CardTitle>
          <CardDescription>每5分钟采样</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={memoryChartConfig} className="aspect-auto h-[200px] w-full">
            <AreaChart data={memoryData}>
              <defs>
                <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={memoryColor} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={memoryColor} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => value.slice(0, 5)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[0, 16]}
                tickFormatter={(value) => `${value}GB`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                dataKey="memory"
                type="natural"
                fill="url(#memoryGradient)"
                stroke={memoryColor}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardTitle>硬盘占用</CardTitle>
          <CardDescription>每5分钟采样</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={diskChartConfig} className="aspect-auto h-[200px] w-full">
            <AreaChart data={diskData}>
              <defs>
                <linearGradient id="diskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={diskColor} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={diskColor} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => value.slice(0, 5)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[0, 500]}
                tickFormatter={(value) => `${value}GB`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                dataKey="disk"
                type="natural"
                fill="url(#diskGradient)"
                stroke={diskColor}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardTitle>网络带宽</CardTitle>
          <CardDescription>每5分钟采样（上传/下载）</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={bandwidthChartConfig} className="aspect-auto h-[200px] w-full">
            <AreaChart data={bandwidthData}>
              <defs>
                <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-upload)" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="var(--color-upload)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="downloadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-download)" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="var(--color-download)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => value.slice(0, 5)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[0, 120]}
                tickFormatter={(value) => `${value}MB/s`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                dataKey="download"
                type="natural"
                fill="url(#downloadGradient)"
                stroke="var(--color-download)"
                strokeWidth={2}
                stackId="bandwidth"
              />
              <Area
                dataKey="upload"
                type="natural"
                fill="url(#uploadGradient)"
                stroke="var(--color-upload)"
                strokeWidth={2}
                stackId="bandwidth"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
