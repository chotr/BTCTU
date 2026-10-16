"use client";

import { DotsThreeVertical, PencilSimple, Trash } from "@phosphor-icons/react";
import { useState } from "react";
import { personName } from "@/lib/shared/names";
import { Badge, Card } from "@/components/ui";
import type { AppState } from "@/lib/store";

/** Tab "Đơn vị": các thẻ đơn vị kèm số nhân sự và trách nhiệm. */
export function DepartmentCards({
  items,
  state,
  allowed,
  onEdit,
}: {
  items: AppState["departments"];
  state: AppState;
  allowed: boolean;
  onEdit: (item: unknown, del?: boolean) => void;
}) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {items.map((d) => (
        <Card key={d.id} className="p-5">
          <div className="flex justify-between gap-3">
            <div>
              <Badge className="rounded-sm px-2 py-0.5">{d.code}</Badge>
              <h2 className="mt-2 text-sm font-semibold">{d.name}</h2>
            </div>
            {allowed && (
              <div className="relative">
                <button
                  type="button"
                  aria-label={`Thao tác ${d.name}`}
                  aria-haspopup="menu"
                  aria-expanded={openMenuId === d.id}
                  onClick={() =>
                    setOpenMenuId(openMenuId === d.id ? null : d.id)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-ctl text-ink-3 transition-colors hover:bg-fill-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
                >
                  <DotsThreeVertical size={18} weight="bold" />
                </button>
                {openMenuId === d.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setOpenMenuId(null)}
                      aria-hidden="true"
                    />
                    <div
                      role="menu"
                      aria-orientation="vertical"
                      className="absolute right-0 top-8 z-20 mt-1 min-w-14 rounded-card bg-surface p-1 shadow-sm text-right"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpenMenuId(null);
                          onEdit(d);
                        }}
                        className="flex w-full items-center justify-end gap-2 rounded-ctl px-2.5 py-1.5 text-left text-[13px] text-ink transition-colors hover:bg-fill hover:text-accent-700"
                      >
                        <span>Sửa</span>
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpenMenuId(null);
                          onEdit(d, true);
                        }}
                        className="flex w-full items-center justify-end gap-2 rounded-ctl px-2.5 py-1.5 text-left text-[13px] text-danger-600 transition-colors hover:bg-danger-50"
                      >
                        <span>Xóa</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-2">
            {d.functionText}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 bg-fill p-3 text-xs">
            <div>
              <p className="text-ink-3">Người đứng đầu</p>
              <p className="mt-1 font-semibold">
                {personName(state, d.headId) ?? "Chưa phân công"}
              </p>
            </div>
            <div>
              <p className="text-ink-3">Nhân sự</p>
              <p className="mt-1 font-semibold">
                {state.people.filter((p) => p.departmentId === d.id).length}{" "}
                người
              </p>
            </div>
          </div>
          <ul className="mt-3 space-y-2 text-xs text-ink-2">
            {state.responsibilities
              .filter((r) => r.departmentId === d.id)
              .map((r) => (
                <li key={r.id}>
                  {r.name}
                  <span className="mt-0.5 block text-ink-3">{r.sourceRef}</span>
                </li>
              ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
