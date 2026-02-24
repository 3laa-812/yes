export function FeaturedProductsSkeleton() {
  const placeholders = Array.from({ length: 8 });

  return (
    <div className="grid grid-cols-2 gap-4 lg:gap-8 sm:grid-cols-3 lg:grid-cols-4">
      {placeholders.map((_, index) => (
        <div
          key={index}
          className="animate-pulse space-y-3 rounded-xl border border-border bg-card/60 p-3"
        >
          <div className="aspect-3/4 w-full rounded-lg bg-muted" />
          <div className="h-3 w-20 rounded bg-muted" />
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-4 w-16 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

