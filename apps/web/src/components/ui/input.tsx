import type { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-9 min-w-0 max-w-full rounded-ctl bg-fill-2 px-2.5 text-[13px] text-ink placeholder:text-ink-3 focus:ring-2 focus:ring-accent-600 ${className}`}
      {...rest}
    />
  );
}
