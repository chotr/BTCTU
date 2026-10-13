"use client";

import Link from "next/link";
import { Badge, Card, ClassificationBadge, EmptyState } from "@/components/ui";
import { evaluationLabel, evaluationTotal } from "@/lib/api";
import type { AppState } from "@/lib/store";
import type { Evaluation } from "@/lib/types";

/** Bảng truy vết đánh giá kèm nguồn/phiên bản quy tắc. */
export function EvaluationTraceTable({
  evaluations,
  state,
}: {
  evaluations: Evaluation[];
  state: AppState;
}) {
  return (
    <Card className="overflow-x-auto">
      <h2 className="p-4 text-sm font-semibold">Truy vết kết quả đánh giá</h2>
      {evaluations.length ? (
        <table className="w-full min-w-[760px] text-[13px]">
          <thead className="bg-fill text-left text-xs text-ink-3">
            <tr>
              {[
                "Đối tượng",
                "Điểm tính",
                "Quyết định",
                "Nguồn / phiên bản",
              ].map((h) => (
                <th key={h} className="p-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {evaluations.map((e) => (
              <tr key={e.id} className="shadow-[0_1px_0_#edf1f6]">
                <td className="p-3">
                  <Link
                    href={`/evaluation/${e.id}`}
                    className="font-medium text-accent-700 hover:underline"
                  >
                    {evaluationLabel(e, state)}
                  </Link>
                </td>
                <td className="p-3 tabular-nums">
                  {evaluationTotal(e).toFixed(2)}
                  {!e.calculationRuns?.length && (
                    <span className="ml-1 text-xs text-ink-3">(mẫu)</span>
                  )}
                </td>
                <td className="p-3">
                  {e.decision ? (
                    <ClassificationBadge value={e.decision.classification} />
                  ) : (
                    <Badge>Chưa quyết định</Badge>
                  )}
                </td>
                <td className="max-w-xs p-3 text-xs text-ink-3">
                  {e.calc.ruleVersion}
                  <p className="mt-1">
                    05-HD/TU → KPI cấu hình → QĐ39 / điều kiện → quyết định
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <EmptyState title="Chưa có hồ sơ trong phạm vi đã chọn" />
      )}
    </Card>
  );
}
