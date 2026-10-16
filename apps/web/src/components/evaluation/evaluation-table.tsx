"use client";

import Link from "next/link";
import {
  Card,
  ClassificationBadge,
  EmptyState,
  EvalStatusBadge,
} from "@/components/ui";
import { evaluationLabel, evaluationTotal } from "@/lib/api";
import type { AppState } from "@/lib/store";
import type { Evaluation } from "@/lib/types";

/** Bảng danh sách hồ sơ đánh giá. */
export function EvaluationTable({
  rows,
  state,
}: {
  rows: Evaluation[];
  state: AppState;
}) {
  return (
    <Card className="overflow-x-auto">
      {rows.length ? (
        <table className="w-full min-w-[850px] text-[13px]">
          <thead className="bg-fill text-left text-xs text-ink-3">
            <tr>
              {["Đối tượng", "Kỳ", "Điểm tính", "Trạng thái", "Quyết định"].map(
                (h) => (
                  <th key={h} className="p-3">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className="shadow-[0_1px_0_#edf1f6] hover:bg-fill">
                <td className="p-3">
                  <Link
                    className="font-semibold text-accent-700 hover:underline"
                    href={`/evaluation/${e.id}`}
                  >
                    {evaluationLabel(e, state)}
                  </Link>
                  <p className="mt-1 text-xs text-ink-3">
                    {e.subjectType === "PERSON" ? "Cá nhân" : "Tập thể phòng"} ·{" "}
                    {
                      state.departments.find((d) => d.id === e.departmentId)
                        ?.shortName
                    }
                  </p>
                </td>
                <td className="p-3">
                  {state.periods.find((p) => p.id === e.periodId)?.name}
                </td>
                <td className="p-3 tabular-nums">
                  {e.calculationRuns?.length
                    ? evaluationTotal(e).toFixed(2)
                    : e.status === "DRAFT"
                      ? "Chưa tính lại"
                      : `${evaluationTotal(e).toFixed(2)} · mẫu`}
                  <p className="mt-1 text-xs text-ink-3">
                    {e.isLeader ? "ABCD" : "ABC"}
                  </p>
                </td>
                <td className="p-3">
                  <EvalStatusBadge status={e.status} />
                </td>
                <td className="p-3">
                  {e.decision ? (
                    <ClassificationBadge value={e.decision.classification} />
                  ) : (
                    <span className="text-ink-3">Chưa quyết định</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <EmptyState
          title="Chưa có hồ sơ phù hợp"
          hint="Tạo hồ sơ trong kỳ đang mở hoặc thay đổi bộ lọc."
        />
      )}
    </Card>
  );
}
