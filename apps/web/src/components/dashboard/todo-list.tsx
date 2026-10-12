"use client";

import Link from "next/link";
import { Card, EmptyState, EvalStatusBadge, TaskStatusBadge } from "@/components/ui";
import { evaluationLabel } from "@/lib/evaluation";
import { personName } from "@/lib/shared/names";
import { fmtDate } from "@/lib/format";
import type { AppState } from "@/lib/store";
import type { Evaluation, Role, Task } from "@/lib/types";

/** Thẻ "Việc cần xử lý": nhiệm vụ và hồ sơ đánh giá đang chờ theo vai trò hiện tại. */
export function TodoList({
  todoTasks,
  todoEvals,
  state,
  role,
}: {
  todoTasks: Task[];
  todoEvals: Evaluation[];
  state: AppState;
  role: Role | undefined;
}) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Việc cần xử lý</h2>
        <Link
          href={role === "cong_chuc" ? "/tasks" : "/approvals"}
          className="text-xs font-medium text-accent-700"
        >
          Xem tất cả
        </Link>
      </div>
      {!todoTasks.length && !todoEvals.length ? (
        <EmptyState
          title="Không còn việc chờ bạn trong kỳ"
          hint="Bạn có thể chuyển kỳ hoặc xem lại hồ sơ đã hoàn tất."
        />
      ) : (
        <div className="space-y-2">
          {todoTasks.slice(0, 6).map((t) => (
            <Link
              key={t.id}
              href={`/tasks/${t.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-ctl bg-fill p-3 hover:bg-accent-50"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium">{t.title}</p>
                <p className="mt-1 text-xs text-ink-3">
                  {personName(state, t.assigneeId)} · Hạn {fmtDate(t.dueAt)}
                </p>
              </div>
              <TaskStatusBadge status={t.status} />
            </Link>
          ))}
          {todoEvals.slice(0, 4).map((e) => (
            <Link
              key={e.id}
              href={`/evaluation/${e.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-ctl bg-fill p-3 hover:bg-accent-50"
            >
              <div>
                <p className="text-[13px] font-medium">
                  Đánh giá · {evaluationLabel(e, state)}
                </p>
                <p className="mt-1 text-xs text-ink-3">
                  {e.subjectType === "PERSON" ? "Cá nhân" : "Tập thể phòng"}
                </p>
              </div>
              <EvalStatusBadge status={e.status} />
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
