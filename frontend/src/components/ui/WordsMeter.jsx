export default function WordsMeter({ used = 0, limit = 500 }) {
  const percent = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const color = percent >= 95 ? "bg-danger" : percent >= 80 ? "bg-warning" : "bg-success";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs text-text-secondary">
        <span>{used.toLocaleString()} / {limit.toLocaleString()} words used</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full border border-line/60 bg-bg">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

