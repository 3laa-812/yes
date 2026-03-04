import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {/* 6 KPI Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card
            key={i}
            className="animate-pulse bg-card/40 border-border/50 shadow-sm"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-4 w-1/2 bg-muted rounded-md" />
              <div className="h-4 w-4 bg-muted rounded-md" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-3/4 bg-muted mb-2 rounded-md" />
              <div className="h-3 w-1/3 bg-muted rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 1: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Area Chart */}
        <div className="col-span-1 lg:col-span-2 h-[400px] rounded-xl border border-border/50 bg-card/40 animate-pulse shadow-sm" />
        {/* Sidebar Bar Chart */}
        <div className="col-span-1 h-[400px] rounded-xl border border-border/50 bg-card/40 animate-pulse shadow-sm" />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods Donut */}
        <div className="col-span-1 lg:col-span-1 h-[400px] rounded-xl border border-border/50 bg-card/40 animate-pulse shadow-sm" />
        {/* Order Status */}
        <div className="col-span-1 lg:col-span-2 h-[400px] rounded-xl border border-border/50 bg-card/40 animate-pulse shadow-sm" />
      </div>
    </div>
  );
}
