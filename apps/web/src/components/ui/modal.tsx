"use client";

import { X } from "@phosphor-icons/react";
import { useEffect, useId, useRef, type ReactNode } from "react";

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
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const node = dialog.current;
    if (open && node && !node.open) node.showModal();
    if (!open && node?.open) node.close();
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      node?.close();
    };
  }, [open]);
  if (!open) return null;
  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="fixed inset-0 m-auto max-h-[88dvh] w-[calc(100%-2rem)] max-w-[640px] overflow-y-auto rounded-card bg-surface text-ink shadow-pop backdrop:bg-ink/35"
    >
      <div className="mb-1 flex items-center justify-between p-4 pb-0">
        <h2 id={titleId} className="text-[15px] font-semibold mb-2">
          {title}
        </h2>
        <button
          type="button"
          aria-label="Đóng hộp thoại"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-ctl text-ink-3 transition-colors hover:bg-fill-2 hover:text-ink absolute top-2 right-2"
        >
          <X size={14} weight="bold" />
        </button>
      </div>
      <div className="flex flex-col gap-3 px-4 pb-4">{children}</div>
      {footer ? (
        <div className="mt-5 flex flex-wrap justify-end gap-2">{footer}</div>
      ) : null}
    </dialog>
  );
}
