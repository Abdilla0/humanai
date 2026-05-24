const styles = {
  free: "border-line/80 bg-subtle/80 text-text-secondary",
  starter: "border-sky-400/20 bg-sky-400/10 text-sky-300",
  pro: "border-brand/25 bg-brand/10 text-brand",
  business: "border-warning/25 bg-warning/10 text-warning",
};

export default function PlanBadge({ plan = "free" }) {
  const label = plan.charAt(0).toUpperCase() + plan.slice(1);
  return (
    <span className={`inline-flex w-max items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.04em] ${styles[plan] || styles.free}`}>
      {label}
    </span>
  );
}

