import type { ReactNode } from "react";

export function Callout({
  tone = "accent",
  icon,
  title,
  children,
}: {
  tone?: "neutral" | "accent" | "warn" | "danger" | "ok";
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
}) {
  const tones = {
    neutral: "bg-fill-2 text-ink-2",
    accent: "bg-accent-50 text-accent-600",
    warn: "bg-warn-50 text-warn-600",
    danger: "bg-danger-50 text-danger-600",
    ok: "bg-ok-50 text-ok-600",
  } as const;
  return (
    <div className={`rounded-card p-3 ${tones[tone].split(" ")[0]}`}>
      <div className="flex items-start gap-2.5">
        {icon ? (
          <span className={`mt-0.5 shrink-0 ${tones[tone].split(" ")[1]}`}>
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <p className={`text-[12px] font-semibold ${tones[tone].split(" ")[1]}`}>
            {title}
          </p>
          {children ? (
            <div className="mt-1 text-[12px] leading-relaxed text-ink-2">
              {children}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
