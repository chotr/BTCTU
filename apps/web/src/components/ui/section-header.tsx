import type { ReactNode } from "react";

export function SectionHeader({
  title,
  hint,
  actions,
}: {
  title: string;
  hint?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[17px] font-semibold leading-tight">{title}</h1>
        {hint ? <p className="mt-0.5 text-[12px] text-ink-3">{hint}</p> : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
