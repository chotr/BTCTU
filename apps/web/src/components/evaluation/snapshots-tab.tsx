"use client";

import { fmtDateTime } from "@/lib/format";
import { personName } from "@/lib/shared/names";
import { Card, ClassificationBadge } from "@/components/ui";
import type { AppState } from "@/lib/store";
import type { Evaluation } from "@/lib/types";

/** Tab "Lần tính & lịch sử": các lần tính bất biến, quyết định và lịch sử. */
export function SnapshotsTab({
  ev,
  state,
}: {
  ev: Evaluation;
  state: AppState;
}) {
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold">Các lần tính bất biến</h2>
        {ev.calculationRuns?.length ? (
          ev.calculationRuns.toReversed().map((r) => (
            <details key={r.id} className="mb-3 rounded-ctl bg-fill p-4">
              <summary className="cursor-pointer text-[13px] font-semibold">
                {fmtDateTime(r.at)} · {r.finalTotal.toFixed(2)} điểm ·{" "}
                {r.ruleVersion}
              </summary>
              <div className="mt-3 space-y-2 text-xs text-ink-2">
                <p>
                  {r.id} · {r.reason}
                </p>
                <p>
                  Điểm gốc: {r.calculatedTotal}; điểm sau điều chỉnh:{" "}
                  {r.finalTotal}
                  {r.override ? ` · Lý do: ${r.override.reason}` : ""}
                </p>
                <p>
                  Trục: {r.axes.map((a) => `${a.code}=${a.value}`).join("; ")}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left">
                    <thead>
                      <tr>
                        <th className="py-2">Nhiệm vụ</th>
                        <th>Khối lượng</th>
                        <th>Chất lượng</th>
                        <th>Danh mục</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.taskSnapshots.map((t) => (
                        <tr key={t.id}>
                          <td className="py-2">
                            {t.id} · {t.status}
                          </td>
                          <td>
                            {t.quantity}/{t.plannedQuantity}
                          </td>
                          <td>{t.quality || "—"}</td>
                          <td>{t.catalogVersion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {r.missingInputs.map((m) => (
                  <p key={m} className="text-warn-600">
                    {m}
                  </p>
                ))}
              </div>
            </details>
          ))
        ) : (
          <p className="text-xs text-ink-3">
            Chưa có lần tính mới; các điểm trong dữ liệu mẫu không được coi là
            snapshot đã xác minh.
          </p>
        )}
      </Card>
      {!!ev.decisionHistory?.length && (
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold">
            Quyết định trước khi mở lại
          </h2>
          {ev.decisionHistory.map((d, i) => (
            <div className="mb-3 text-xs" key={i}>
              <ClassificationBadge value={d.classification} />
              <p className="mt-2">
                {fmtDateTime(d.at)} · {d.note ?? "Quyết định mẫu"}
              </p>
            </div>
          ))}
        </Card>
      )}
      <Card className="p-5">
        <h2 className="mb-4 text-sm font-semibold">Nhật ký hồ sơ</h2>
        <ol className="space-y-4">
          {ev.history.toReversed().map((h) => (
            <li key={h.id} className="text-xs">
              <p className="font-semibold">{h.action}</p>
              <p className="mt-1 text-ink-2">{h.note}</p>
              <p className="mt-1 text-ink-3">
                {fmtDateTime(h.at)} ·{" "}
                {personName(state, h.actorId) ?? h.actorId}
              </p>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
