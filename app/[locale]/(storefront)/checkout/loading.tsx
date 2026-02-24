export default function CheckoutLoading() {
  const skeletonLine = "h-4 w-full rounded bg-muted";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-8 w-48 rounded bg-muted animate-pulse mb-8" />
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card/60 p-6 space-y-4 animate-pulse">
            <div className="h-5 w-40 rounded bg-muted" />
            <div className="space-y-3">
              <div className={`grid grid-cols-2 gap-4`}>
                <div className={skeletonLine} />
                <div className={skeletonLine} />
              </div>
              <div className={skeletonLine} />
              <div className={skeletonLine} />
              <div className={skeletonLine} />
              <div className={skeletonLine} />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card/60 p-6 space-y-4 animate-pulse">
            <div className="h-5 w-32 rounded bg-muted" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 rounded-lg bg-muted" />
              <div className="h-20 rounded-lg bg-muted" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card/60 p-6 space-y-4 animate-pulse">
          <div className="h-5 w-40 rounded bg-muted" />
          <div className="space-y-3 max-h-[400px] overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex gap-4 py-2 border-b border-border last:border-0"
              >
              <div className="h-16 w-16 rounded bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 rounded bg-muted" />
                  <div className="h-3 w-24 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-border pt-4">
            <div className="flex justify-between">
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="h-3 w-10 rounded bg-muted" />
            </div>
            <div className="flex justify-between pt-2">
              <div className="h-4 w-16 rounded bg-muted" />
              <div className="h-4 w-20 rounded bg-muted" />
            </div>
          </div>
          <div className="mt-4 h-12 w-full rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}

