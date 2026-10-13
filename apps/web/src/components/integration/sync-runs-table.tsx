"use client";

import { Badge, Button, Card, EmptyState } from "@/components/ui";
import { PROFILES, type ProfileKey } from "@/lib/api";
import { fmtDateTime } from "@/lib/format";
import type { SyncRun } from "@/lib/store";

/** Bảng lịch sử đồng bộ kèm điểm kiểm tra và thao tác thử lại. */
export function SyncRunsTable({
  runs,
  busy,
  onRetry,
}: {
  runs: SyncRun[];
  busy: boolean;
  onRetry: (run: SyncRun) => void;
}) {
  return (
    <Card className="overflow-x-auto">
      <h2 className="p-4 text-sm font-semibold">
        Lịch sử / checkpoint / thử lại
      </h2>
      {runs.length ? (
        <table className="w-full min-w-[950px] text-[13px]">
          <thead className="bg-fill text-left text-xs text-ink-3">
            <tr>
              {[
                "Thời gian / profile",
                "Kết quả",
                "Đối soát",
                "Correlation ID",
                "Chi tiết",
                "",
              ].map((h, i) => (
                <th key={i} className="p-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {runs.map((r) => (
              <tr key={r.id} className="shadow-[0_1px_0_#edf1f6]">
                <td className="p-3">
                  {fmtDateTime(r.at)}
                  <p className="mt-1 text-xs text-ink-3">
                    {PROFILES[r.profile as ProfileKey]?.name}
                  </p>
                </td>
                <td className="p-3">
                  <Badge tone={r.status === "SUCCESS" ? "ok" : "danger"}>
                    {r.status}
                  </Badge>
                </td>
                <td className="p-3">
                  {r.records} bản ghi
                  <p className="mt-1 text-xs text-ink-3">
                    Checkpoint {r.checkpoint}
                  </p>
                </td>
                <td className="p-3 font-mono text-xs">{r.correlationId}</td>
                <td className="max-w-72 p-3 text-xs text-ink-2">
                  {r.error ?? r.purpose}
                  {r.retryOf && (
                    <p className="mt-1">Retry của {r.retryOf.slice(0, 8)}</p>
                  )}
                </td>
                <td className="p-3">
                  {r.status === "FAILED" &&
                    !runs.some(
                      (x) => x.retryOf === r.id && x.status === "SUCCESS",
                    ) && (
                      <Button disabled={busy} onClick={() => onRetry(r)}>
                        Thử lại
                      </Button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <EmptyState
          title="Chưa chạy kiểm tra đồng bộ"
          hint="Xem payload rồi chạy thành công hoặc thử tình huống lỗi."
        />
      )}
    </Card>
  );
}
