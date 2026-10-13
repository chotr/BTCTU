"use client";

import { Button, Card, EmptyState } from "@/components/ui";
import type { AppState } from "@/lib/store";
import { ORG_TAB_LABELS, type OrgTab } from "./model";

/** Tab nhân sự / chức vụ / trách nhiệm: bảng tham chiếu gọn. */
export function MasterTable({
  tab,
  items,
  state,
  allowed,
  onEdit,
  onHistory,
}: {
  tab: OrgTab;
  items: readonly unknown[];
  state: AppState;
  allowed: boolean;
  onEdit: (item: unknown, del?: boolean) => void;
  onHistory: (id: string) => void;
}) {
  return (
    <Card className="overflow-x-auto">
      {items.length ? (
        <table className="w-full min-w-[640px] text-[13px]">
          <thead className="bg-fill text-left text-xs text-ink-3">
            <tr>
              <th className="p-3">{ORG_TAB_LABELS[tab]}</th>
              <th className="p-3">Thông tin / tham chiếu</th>
              <th className="p-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const r = item as unknown as Record<string, string>;
              return (
                <tr
                  key={r.id}
                  className="shadow-[0_1px_0_#edf1f6] hover:bg-fill"
                >
                  <td className="p-3 font-semibold">
                    {r.name ?? r.title}
                    <p className="mt-1 text-xs font-normal text-ink-3">
                      {tab === "people"
                        ? r.title
                        : state.departments.find((d) => d.id === r.departmentId)
                            ?.name}
                    </p>
                  </td>
                  <td className="max-w-lg p-3 text-ink-2">
                    {tab === "people" ? (
                      <>
                        {
                          state.departments.find((d) => d.id === r.departmentId)
                            ?.shortName
                        }{" "}
                        ·{" "}
                        {
                          state.positions.find((p) => p.id === r.positionRefId)
                            ?.title
                        }
                      </>
                    ) : (
                      (r.scope ?? r.sourceRef)
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      {tab === "people" && (
                        <Button variant="ghost" onClick={() => onHistory(r.id)}>
                          Lịch sử
                        </Button>
                      )}
                      {allowed && (
                        <>
                          <Button onClick={() => onEdit(item)}>Sửa</Button>
                          <Button
                            variant="ghost"
                            onClick={() => onEdit(item, true)}
                          >
                            Xóa
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <EmptyState title="Không có dữ liệu phù hợp" />
      )}
    </Card>
  );
}
