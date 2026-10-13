import type { ReactNode } from "react";
import { Card } from "./card";

export function StatCard({
  label,
  value,
  sub,
  icon,
  tone = "accent",
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: ReactNode;
  tone?: "accent" | "ok" | "warn" | "danger";
}) {
  const toneText = {
    accent: "text-accent-600",
    ok: "text-ok-600",
    warn: "text-warn-600",
    danger: "text-danger-600",
  }[tone];
  const toneBg = {
    accent: "bg-accent-50",
    ok: "bg-ok-50",
    warn: "bg-warn-50",
    danger: "bg-danger-50",
  }[tone];
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <p className="text-[12px] font-medium text-ink-3">{label}</p>
        {icon ? (
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-card ${toneBg} ${toneText}`}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-[22px] font-semibold leading-none tracking-tight">
        {value}
      </p>
      {sub ? <p className="mt-1.5 text-[11px] text-ink-3">{sub}</p> : null}
    </Card>
  );
}
