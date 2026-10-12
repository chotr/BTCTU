export function Progress({
  value,
  tone = "accent",
}: {
  value: number;
  tone?: "accent" | "ok" | "danger";
}) {
  const fill = {
    accent: "bg-accent-600",
    ok: "bg-ok-600",
    danger: "bg-danger-600",
  }[tone];
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label="Tiến độ hoàn thành"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-1.5 w-full rounded-pill bg-fill-2"
    >
      <div
        className={`h-full rounded-pill ${fill}`}
        style={{ width: pct + "%" }}
      />
    </div>
  );
}
