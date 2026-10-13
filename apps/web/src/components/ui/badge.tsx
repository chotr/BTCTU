import type { ReactNode } from "react";

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "accent" | "ok" | "warn" | "danger";
  children: ReactNode;
}) {
  const tones = {
    neutral: "bg-fill-2 text-ink-2",
    accent: "bg-accent-50 text-accent-600",
    ok: "bg-ok-50 text-ok-600",
    warn: "bg-warn-50 text-warn-600",
    danger: "bg-danger-50 text-danger-600",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
