"use client";

import { X } from "@phosphor-icons/react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  CLASS_LABELS,
  EVAL_STATUS_LABELS,
  TASK_STATUS_LABELS,
  type Classification,
  type EvalStatus,
  type TaskStatus,
} from "@/lib/types";
import { initials } from "@/lib/format";

/* ---------- primitives ---------- */

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`rounded-card bg-surface shadow-card ${className}`}>{children}</div>;
}

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
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h1 className="text-[17px] font-semibold leading-tight">{title}</h1>
        {hint ? <p className="mt-0.5 text-[12px] text-ink-3">{hint}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

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
        {icon ? <span className={`flex h-7 w-7 items-center justify-center rounded-card ${toneBg} ${toneText}`}>{icon}</span> : null}
      </div>
      <p className="mt-2 text-[22px] font-semibold leading-none tracking-tight">{value}</p>
      {sub ? <p className="mt-1.5 text-[11px] text-ink-3">{sub}</p> : null}
    </Card>
  );
}

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
    <span className={`inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const tone: Record<TaskStatus, "neutral" | "accent" | "ok" | "warn" | "danger"> = {
    ASSIGNED: "neutral",
    IN_PROGRESS: "accent",
    SUBMITTED: "warn",
    RETURNED: "danger",
    REVIEWED: "accent",
    ACCEPTED: "ok",
    LOCKED: "neutral",
  };
  return <Badge tone={tone[status]}>{TASK_STATUS_LABELS[status]}</Badge>;
}

export function ClassificationBadge({ value }: { value: Classification }) {
  const tone: Record<Classification, "ok" | "accent" | "warn" | "danger"> = {
    XUAT_SAC: "ok",
    TOT: "accent",
    HOAN_THANH: "warn",
    KHONG_HOAN_THANH: "danger",
  };
  return <Badge tone={tone[value]}>{CLASS_LABELS[value]}</Badge>;
}

export function EvalStatusBadge({ status }: { status: EvalStatus }) {
  const tone: Record<EvalStatus, "neutral" | "accent" | "ok" | "warn"> = {
    DRAFT: "neutral",
    SUBMITTED: "warn",
    REVIEWED: "accent",
    APPROVED: "ok",
    LOCKED: "neutral",
  };
  return <Badge tone={tone[status]}>{EVAL_STATUS_LABELS[status]}</Badge>;
}

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
      className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-ctl px-3 text-[13px] font-medium transition-all duration-100 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 ${buttonVariants[variant]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-ink-2">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-ink-3">{hint}</span> : null}
    </label>
  );
}

export function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-6 w-6 text-[10px]", md: "h-9 w-9 text-[12px]", lg: "h-12 w-12 text-[15px]" } as const;
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-pill bg-accent-100 font-semibold text-accent-700 ${sizes[size]}`}>
      {initials(name)}
    </span>
  );
}

export function Progress({
  value,
  tone = "accent",
}: {
  value: number;
  tone?: "accent" | "ok" | "danger";
}) {
  const fill = { accent: "bg-accent-600", ok: "bg-ok-600", danger: "bg-danger-600" }[tone];
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-1.5 w-full rounded-pill bg-fill-2">
      <div className={`h-full rounded-pill ${fill}`} style={{ width: pct + "%" }} />
    </div>
  );
}

export function Callout({
  tone = "accent",
  icon,
  title,
  children,
}: {
  tone?: "accent" | "warn" | "danger" | "ok";
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
}) {
  const tones = {
    accent: "bg-accent-50 text-accent-600",
    warn: "bg-warn-50 text-warn-600",
    danger: "bg-danger-50 text-danger-600",
    ok: "bg-ok-50 text-ok-600",
  } as const;
  return (
    <div className={`rounded-card p-3 ${tones[tone].split(" ")[0]}`}>
      <div className="flex items-start gap-2.5">
        {icon ? <span className={`mt-0.5 shrink-0 ${tones[tone].split(" ")[1]}`}>{icon}</span> : null}
        <div className="min-w-0">
          <p className={`text-[12px] font-semibold ${tones[tone].split(" ")[1]}`}>{title}</p>
          {children ? <div className="mt-1 text-[12px] leading-relaxed text-ink-2">{children}</div> : null}
        </div>
      </div>
    </div>
  );
}

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
      {icon ? <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-card bg-fill-2 text-ink-3">{icon}</div> : null}
      <p className="text-[13px] font-semibold">{title}</p>
      {hint ? <p className="mt-1 max-w-[340px] text-[12px] leading-relaxed text-ink-3">{hint}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <div className="relative w-full max-w-[520px] rounded-card bg-surface p-5 shadow-pop">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-ctl text-ink-3 transition-colors hover:bg-fill-2 hover:text-ink">
            <X size={14} weight="bold" />
          </button>
        </div>
        <div className="flex flex-col gap-3">{children}</div>
        {footer ? <div className="mt-5 flex justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}

export function Chip({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center rounded-pill bg-fill-2 px-2 py-0.5 text-[11px] font-medium text-ink-2 ${className}`}>{children}</span>;
}
