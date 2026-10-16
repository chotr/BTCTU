import type { ButtonHTMLAttributes, ReactNode } from "react";

const buttonVariants = {
  primary: "bg-accent-600 text-white hover:bg-accent-700 shadow-card",
  secondary: "bg-fill-2 text-ink hover:bg-[#e2e7ee]",
  ghost: "bg-transparent text-accent-600 hover:bg-accent-50",
  danger: "bg-danger-600 text-white hover:bg-[#9e3b32] shadow-card",
} as const;

export function Button({
  variant = "secondary",
  icon,
  children,
  className = "",
  ...rest
}: {
  variant?: keyof typeof buttonVariants;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-4 h-auto shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-ctl px-3 py-1 text-[13px] font-medium transition-colors duration-100 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 ${buttonVariants[variant]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
