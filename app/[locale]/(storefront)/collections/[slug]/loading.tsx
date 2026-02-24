export default function CollectionLoading() {
  const placeholders = Array.from({ length: 8 });

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="h-8 w-48 rounded bg-muted animate-pulse" />
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
        </div>
        <div className="mt-6 h-8 w-64 rounded-full bg-muted animate-pulse" />
        <div className="mt-6 grid grid-cols-2 gap-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
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
      </div>
    </div>
  );
}

