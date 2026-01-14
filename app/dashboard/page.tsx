import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="min-h-svh bg-muted">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">管理后台</h1>
        <div className="bg-card p-6 rounded-lg">
          <p className="text-muted-foreground mb-4">
            欢迎来到 Guardian 管理后台
          </p>
          <div className="space-y-4">
            <p>这里是您的仪表板内容区域。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
