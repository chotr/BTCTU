"use client";

import { Badge, Card } from "@/components/ui";
import { fmtDateTime } from "@/lib/format";
import { ROLES, type AuditEvent, type Role } from "@/lib/types";

/** Hoạt động gần đây cho quản lý, hoặc luồng công việc cá nhân cho nhân viên. */
export function ActivityPanel({
  role,
  audit,
}: {
  role: Role | undefined;
  audit: AuditEvent[];
}) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 text-sm font-semibold">
        {role === ROLES.congChuc ? "Lộ trình" : "Hoạt động gần đây"}
      </h2>
      {role === ROLES.congChuc ? (
        <ol className="space-y-3 text-xs text-ink-2">
          <li>1. Mở nhiệm vụ và nhập kết quả / minh chứng.</li>
          <li>2. Nộp nghiệm thu, chờ trưởng phòng xử lý.</li>
          <li>3. Tính KPI từ nhiệm vụ được nghiệm thu.</li>
          <li>4. Gửi bản tự đánh giá kèm nhận xét.</li>
        </ol>
      ) : (
        <div className="space-y-4">
          {audit.slice(0, 5).map((a) => (
            <div key={a.id} className="text-xs">
              <div className="flex justify-between gap-2">
                <p className="font-medium">{a.action}</p>
                {a.outcome === "DENIED" && <Badge tone="danger">Từ chối</Badge>}
              </div>
              <p className="mt-1 break-words text-ink-3">
                {a.resource} · {fmtDateTime(a.at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
