import type { SelectHTMLAttributes } from "react";

export function Select({
  className = "",
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`h-9 min-w-0 max-w-full rounded-ctl bg-fill-2 px-2.5 text-[13px] text-ink focus:ring-2 focus:ring-accent-600 ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}
