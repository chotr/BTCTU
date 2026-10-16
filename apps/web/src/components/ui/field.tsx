"use client";

import {
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from "react";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  const fieldId = useId();
  const control = children as ReactElement<{
    id?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
  }>;
  const controlId = isValidElement(control)
    ? (control.props.id ?? fieldId)
    : fieldId;
  return (
    <div className="block">
      <label
        id={`${fieldId}-label`}
        htmlFor={controlId}
        className="mb-1 block text-[12px] font-medium text-ink-2"
      >
        {label}
      </label>
      {isValidElement(control)
        ? cloneElement(control, {
            id: controlId,
            "aria-labelledby": `${fieldId}-label`,
            ...(hint ? { "aria-describedby": `${fieldId}-hint` } : {}),
          })
        : children}
      {hint ? (
        <span
          id={`${fieldId}-hint`}
          className="mt-1 block text-[12px] text-ink-3"
        >
          {hint}
        </span>
      ) : null}
    </div>
  );
}
