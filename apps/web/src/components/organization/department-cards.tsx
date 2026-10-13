"use client";

import { PencilSimple, Trash } from "@phosphor-icons/react";
import { personName } from "@/lib/shared/names";
import { Badge, Button, Card } from "@/components/ui";
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
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {items.map((d) => (
        <Card key={d.id} className="p-5">
          <div className="flex justify-between gap-3">
            <div>
              <Badge>{d.code}</Badge>
              <h2 className="mt-2 text-sm font-semibold">{d.name}</h2>
            </div>
            {allowed && (
              <div className="flex gap-1">
                <Button
                  aria-label={`Sửa ${d.name}`}
                  onClick={() => onEdit(d)}
                  icon={<PencilSimple size={15} />}
                >
                  Sửa
                </Button>
                <Button
                  aria-label={`Xóa ${d.name}`}
                  variant="ghost"
                  onClick={() => onEdit(d, true)}
                  icon={<Trash size={15} />}
                >
                  Xóa
                </Button>
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
