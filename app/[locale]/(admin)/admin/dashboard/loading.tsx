export default function DashboardLoading() {
  const statCard = (
    <div className="rounded-xl border border-border bg-card/60 p-4 space-y-3 animate-pulse">
      <div className="h-4 w-24 rounded bg-muted" />
      <div className="h-6 w-16 rounded bg-muted" />
      <div className="h-3 w-20 rounded bg-muted" />
    </div>
  );

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="space-y-2">
        <div className="h-7 w-40 rounded bg-muted animate-pulse" />
        <div className="h-4 w-64 rounded bg-muted animate-pulse" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>{statCard}</div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="col-span-1 lg:col-span-2 h-[400px] rounded-xl border border-border bg-card/60 animate-pulse" />
        <div className="h-[400px] rounded-xl border border-border bg-card/60 animate-pulse" />
        <div className="h-[400px] rounded-xl border border-border bg-card/60 animate-pulse" />
      </div>
    </div>
  );
}

