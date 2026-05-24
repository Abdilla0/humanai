export default function LoadingSkeleton() {
  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-lg border border-line/80 bg-bg-elevated p-5 shimmer">
      <div className="space-y-4">
        <div className="h-4 w-2/3 rounded bg-subtle" />
        <div className="h-4 w-full rounded bg-subtle" />
        <div className="h-4 w-11/12 rounded bg-subtle" />
        <div className="h-4 w-5/6 rounded bg-subtle" />
        <div className="h-4 w-full rounded bg-subtle" />
        <div className="h-4 w-3/4 rounded bg-subtle" />
      </div>
    </div>
  );
}

