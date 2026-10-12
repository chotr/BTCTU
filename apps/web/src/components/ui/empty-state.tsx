import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {icon ? (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-card bg-fill-2 text-ink-3">
          {icon}
        </div>
      ) : null}
      <p className="text-[13px] font-semibold">{title}</p>
      {hint ? (
        <p className="mt-1 max-w-[340px] text-[12px] leading-relaxed text-ink-3">
          {hint}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
