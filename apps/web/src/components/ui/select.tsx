"use client";

import { CaretDown, Check } from "@phosphor-icons/react";
import React, {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";

interface ParsedOption {
  value: string;
  label: string;
  disabled?: boolean;
}

function getOptionLabel(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(getOptionLabel).join("");
  }
  if (
    React.isValidElement(children) &&
    children.props &&
    "children" in (children.props as Record<string, unknown>)
  ) {
    return getOptionLabel(
      (children.props as { children?: ReactNode }).children,
    );
  }
  return "";
}

function extractOptions(children: ReactNode): ParsedOption[] {
  const options: ParsedOption[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === React.Fragment) {
      options.push(
        ...extractOptions(
          (child.props as { children?: ReactNode }).children,
        ),
      );
    } else if (child.type === "option") {
      const props = child.props as {
        value?: string | number;
        disabled?: boolean;
        children?: ReactNode;
      };
      const val =
        props.value !== undefined
          ? String(props.value)
          : getOptionLabel(props.children);
      options.push({
        value: val,
        label: getOptionLabel(props.children) || val,
        disabled: !!props.disabled,
      });
    }
  });
  return options;
}

export function Select({
  className = "",
  children,
  value,
  defaultValue,
  onChange,
  disabled,
  placeholder,
  id,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { placeholder?: string }) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const nativeSelectRef = useRef<HTMLSelectElement>(null);
  const isSelectingRef = useRef(false);

  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string>(() => {
    if (defaultValue !== undefined) return String(defaultValue);
    return "";
  });
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [alignRight, setAlignRight] = useState(false);

  const options = extractOptions(children);

  const currentValue =
    value !== undefined
      ? String(value)
      : internalValue || (options[0]?.value ?? "");

  const selectedOption = options.find((o) => o.value === currentValue);

  const displayLabel =
    selectedOption?.label ??
    placeholder ??
    (options.length > 0 ? options[0]?.label : "— Chọn —");

  const toggleOpen = () => {
    if (disabled) return;
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setAlignRight(rect.right > window.innerWidth / 2);
      const idx = options.findIndex((o) => o.value === currentValue);
      setFocusedIndex(idx >= 0 ? idx : 0);
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (opt: ParsedOption) => {
    if (opt.disabled) return;
    setIsOpen(false);

    if (value === undefined) {
      setInternalValue(opt.value);
    }

    if (nativeSelectRef.current) {
      nativeSelectRef.current.value = opt.value;
      nativeSelectRef.current.dispatchEvent(
        new Event("input", { bubbles: true }),
      );
      nativeSelectRef.current.dispatchEvent(
        new Event("change", { bubbles: true }),
      );
    }

    if (onChange) {
      isSelectingRef.current = true;
      const syntheticEvent = {
        target: { value: opt.value, name: rest.name ?? "", id: id ?? "" },
        currentTarget: {
          value: opt.value,
          name: rest.name ?? "",
          id: id ?? "",
        },
        persist: () => {},
        bubbles: true,
        cancelable: true,
        defaultPrevented: false,
        isDefaultPrevented: () => false,
        isPropagationStopped: () => false,
        stopPropagation: () => {},
        preventDefault: () => {},
      } as unknown as React.ChangeEvent<HTMLSelectElement>;
      onChange(syntheticEvent);
      setTimeout(() => {
        isSelectingRef.current = false;
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (!isOpen) {
      if (
        e.key === "ArrowDown" ||
        e.key === "ArrowUp" ||
        e.key === "Enter" ||
        e.key === " "
      ) {
        e.preventDefault();
        toggleOpen();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.min(prev + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < options.length) {
        const opt = options[focusedIndex];
        if (opt && !opt.disabled) {
          handleSelect(opt);
        }
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === "Tab") {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen && listboxRef.current && focusedIndex >= 0) {
      const item = listboxRef.current.children[focusedIndex] as HTMLElement;
      item?.scrollIntoView?.({ block: "nearest" });
    }
  }, [isOpen, focusedIndex]);

  return (
    <div
      ref={containerRef}
      className={`relative inline-block min-w-0 max-w-full ${className}`}
    >
      <button
        type="button"
        id={id ? `${id}-btn` : undefined}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-label={rest["aria-label"]}
        aria-labelledby={rest["aria-labelledby"]}
        disabled={disabled}
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
        className={`flex h-9 w-full items-center justify-between gap-2 rounded-ctl bg-fill-2 px-2.5 text-left text-[13px] text-ink transition-colors cursor-pointer hover:bg-fill focus-visible:outline-none outline-none shadow-none disabled:pointer-events-none disabled:opacity-50 ${
          isOpen ? "bg-surface shadow-sm" : ""
        }`}
      >
        <span className="truncate">{displayLabel}</span>
        <CaretDown
          size={14}
          weight="bold"
          className={`shrink-0 text-ink-3 transition-transform duration-150 ${
            isOpen ? "rotate-180 text-accent-600" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-label={rest["aria-label"]}
            className={`absolute top-full z-50 mt-1 max-h-60 min-w-full overflow-y-auto rounded-card bg-surface p-1 shadow-pop border border-fill-2 w-max max-w-[min(100vw-2rem,420px)] ${
              alignRight ? "right-0" : "left-0"
            }`}
            style={{ scrollbarWidth: "thin" }}
          >
            {options.length === 0 ? (
              <div className="px-3 py-2 text-center text-xs text-ink-3">
                Không có lựa chọn
              </div>
            ) : (
              options.map((opt, idx) => {
                const isSelected = opt.value === currentValue;
                const isFocused = idx === focusedIndex;
                return (
                  <button
                    key={`${opt.value}-${idx}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setFocusedIndex(idx)}
                    className={`flex w-full items-center justify-between gap-2.5 rounded-ctl px-2.5 py-1.5 text-left text-[13px] transition-colors ${
                      isSelected
                        ? "bg-accent-50 font-medium text-accent-700"
                        : isFocused
                          ? "bg-fill text-ink"
                          : "text-ink hover:bg-fill"
                    } ${opt.disabled ? "pointer-events-none opacity-40" : "cursor-pointer"}`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <Check
                        size={14}
                        weight="bold"
                        className="shrink-0 text-accent-600"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Hidden native select for form accessibility, FormData, and tests */}
      <select
        ref={nativeSelectRef}
        tabIndex={-1}
        aria-hidden="true"
        id={id}
        name={rest.name}
        required={rest.required}
        disabled={disabled}
        value={currentValue}
        onChange={(e) => {
          if (isSelectingRef.current) return;
          if (value === undefined) {
            setInternalValue(e.target.value);
          }
          onChange?.(e);
        }}
        className="sr-only pointer-events-none absolute inset-0 -z-10 opacity-0"
        {...rest}
      >
        {children}
      </select>
    </div>
  );
}
