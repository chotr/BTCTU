import type { ReactNode } from "react";

export function Badge({
  tone = "neutral",
  children,
  className = ""
}: {
  tone?: "neutral" | "accent" | "ok" | "warn" | "danger";
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    neutral: "bg-fill-2 text-ink-2",
    accent: "text-accent-600",
    ok: "text-ok-600",
    warn: "text-warn-600",
    danger: "text-danger-600",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[12px] font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
