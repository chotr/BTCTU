import type { ReactNode } from "react";

export function Chip({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-pill bg-fill-2 px-2 py-0.5 text-[11px] font-medium text-ink-2 ${className}`}
    >
      {children}
    </span>
  );
}
