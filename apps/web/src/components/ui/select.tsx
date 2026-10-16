"use client";

import { CaretDown } from "@phosphor-icons/react";
import React, { type SelectHTMLAttributes } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void;
}

export function Select({
  className = "",
  children,
  onChange,
  onValueChange,
  ...rest
}: SelectProps) {
  return (
    <div className="relative inline-block min-w-0 max-w-full">
      <select
        className={`h-9 w-full appearance-none rounded-ctl bg-fill-2 pl-2.5 pr-8 text-left text-[13px] text-ink transition-colors cursor-pointer hover:bg-fill focus-visible:outline-none outline-none shadow-none disabled:pointer-events-none disabled:opacity-50 ${className}`}
        onChange={(e) => {
          onChange?.(e);
          onValueChange?.(e.target.value);
        }}
        {...rest}
      >
        {children}
      </select>
      <CaretDown
        size={14}
        weight="bold"
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3"
      />
    </div>
  );
}
