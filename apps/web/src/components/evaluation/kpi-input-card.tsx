"use client";

import Link from "next/link";
import {
  Card,
  EmptyState,
  SectionHeader,
  TaskStatusBadge,
} from "@/components/ui";
import type { Task } from "@/lib/types";

/** Thẻ "Đầu vào KPI": các nhiệm vụ cấu thành đánh giá trong kỳ này. */
export function KpiInputCard({ tasks }: { tasks: Task[] }) {
  return (
    <Card className="p-5">
      <SectionHeader
        title="Đầu vào KPI"
        hint={`${tasks.length} nhiệm vụ trong phạm vi và kỳ đánh giá; nhiệm vụ hủy được loại trừ.`}
      />
      {tasks.length ? (
        <ul className="space-y-2">
          {tasks.map((t) => (
            <li
              key={t.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-ctl bg-fill p-3 text-xs"
            >
              <div>
                <Link
                  href={`/tasks/${t.id}`}
                  className="font-medium text-accent-700 hover:underline"
                >
                  {t.title}
                </Link>
                <p className="mt-1 text-ink-3">
                  {t.result?.quantity ?? 0}/{t.plannedQuantity ?? 1} sản phẩm ·{" "}
                  {t.result?.qualityLevel ?? "Chưa có kết quả"}
                </p>
              </div>
              <TaskStatusBadge status={t.status} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="Chưa có nhiệm vụ trong kỳ"
          hint="Cần nhiệm vụ đã nghiệm thu để có dữ liệu tính điểm."
        />
      )}
    </Card>
  );
}
