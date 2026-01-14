import { IconCpu, IconDatabase, IconNetwork, IconServer } from "@tabler/icons-react"
 
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type UsageStatus = "normal" | "medium" | "high" | "critical"

function getUsageStatus(percentage: number): UsageStatus {
  if (percentage >= 90) return "critical"
  if (percentage >= 70) return "high"
  if (percentage >= 50) return "medium"
  return "normal"
}

function getStatusText(status: UsageStatus): string {
  const statusMap = {
    normal: "正常",
    medium: "中等",
    high: "警告",
    critical: "严重",
  }
  return statusMap[status]
}

function getStatusColor(status: UsageStatus): string {
  const colorMap = {
    normal: "text-green-600 dark:text-green-400",
    medium: "text-yellow-400 dark:text-yellow-300",
    high: "text-orange-600 dark:text-orange-400",
    critical: "text-red-600 dark:text-red-400",
  }
  return colorMap[status]
}

function getBadgeVariant(status: UsageStatus): "default" | "secondary" | "outline" {
  if (status === "critical") return "default"
  if (status === "high") return "secondary"
  return "outline"
}
 
export function ResourceCards() {
  const cpuUsage = 45.2
  const cpuStatus = getUsageStatus(cpuUsage)
  
  const memoryUsage = 75.3
  const memoryStatus = getUsageStatus(memoryUsage)
  
  const diskUsage = 90.0
  const diskStatus = getUsageStatus(diskUsage)
  
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>CPU 负载</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {cpuUsage}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconCpu className="size-4" />
              8 核
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            总负载: {(cpuUsage * 8).toFixed(1)}% <IconServer className="size-4" />
          </div>
          <div className="text-muted-foreground">
            核心数: 8 | 使用率: <span className={getStatusColor(cpuStatus)}>{getStatusText(cpuStatus)}</span>
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>内存占用</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            8.2 GB
          </CardTitle>
          <CardAction>
            <Badge variant={getBadgeVariant(memoryStatus)}>
              <IconDatabase className="size-4" />
              {memoryUsage}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            总容量: 16 GB <IconDatabase className="size-4" />
          </div>
          <div className="text-muted-foreground">
            可用: 7.8 GB | 使用率: <span className={getStatusColor(memoryStatus)}>{getStatusText(memoryStatus)}</span>
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>硬盘占用</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            450 GB
          </CardTitle>
          <CardAction>
            <Badge variant={getBadgeVariant(diskStatus)}>
              <IconServer className="size-4" />
              90.0%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            总容量: 500 GB <IconServer className="size-4" />
          </div>
          <div className="text-muted-foreground">
            可用: 50 GB | 使用率: <span className={getStatusColor(diskStatus)}>{getStatusText(diskStatus)}</span>
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>网络带宽</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            125.4
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconNetwork className="size-4" />
              MB/s
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <span className="text-green-600">↑ 85.2 MB/s</span>
            <span className="text-red-600">↓ 40.2 MB/s</span>
            <IconNetwork className="size-4" />
          </div>
          <div className="text-muted-foreground">
            带宽使用: 125.4 MB/s | 状态: <span className="text-yellow-400 dark:text-yellow-300">中等</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
