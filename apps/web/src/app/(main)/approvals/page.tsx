"use client";
import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { scopedData } from "@/lib/exports";
import { evaluationLabel } from "@/lib/evaluation";
import { canAssign } from "@/lib/policy";
import { personName } from "@/lib/shared/names";
import {
  TASK_IN_REVIEW,
  EVAL_IN_REVIEW,
  inGroup,
} from "@/lib/domain/workflow";
import {
  Badge,
  Card,
  EmptyState,
  EvalStatusBadge,
  SectionHeader,
  Select,
  TaskStatusBadge,
} from "@/components/ui";
export default function ApprovalsPage() {
  const state = useApp();
  const { user } = state;
  const scoped = scopedData(state);
  const [period, setPeriod] = useState("ALL");
  if (!canAssign(user))
    return (
      <Card>
        <EmptyState
          title="Không có quyền xử lý hồ sơ của người khác"
          hint="Tài khoản công chức sử dụng Nhiệm vụ và Hồ sơ đánh giá cá nhân."
        />
      </Card>
    );
  const tasks = scoped.tasks.filter(
    (t) =>
      inGroup(TASK_IN_REVIEW, t.status) &&
      t.assigneeId !== user?.id &&
      (period === "ALL" ||
        t.periodId === period ||
        t.period === state.periods.find((p) => p.id === period)?.name),
  );
  const evals = scoped.evaluations.filter(
    (e) =>
      (period === "ALL" || e.periodId === period) &&
      e.subjectId !== user?.id &&
      (user?.role === "lanh_dao"
        ? inGroup(EVAL_IN_REVIEW, e.status)
        : e.subjectType === "PERSON" && e.status === "SUBMITTED"),
  );
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Xử lý & phê duyệt"
        hint="Hàng đợi theo vai trò và phạm vi. Mở hồ sơ để kiểm tra đầu vào trước khi quyết định."
        actions={
          <Select
            aria-label="Kỳ xử lý"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="ALL">Mọi kỳ</option>
            {state.periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        }
      />
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 flex items-center justify-between text-sm font-semibold">
            Kết quả chờ nghiệm thu <Badge tone="warn">{tasks.length}</Badge>
          </h2>
          {tasks.length ? (
            tasks.map((t) => (
              <Link
                key={t.id}
                href={`/tasks/${t.id}`}
                className="mb-2 block rounded-ctl bg-fill p-4 hover:bg-accent-50"
              >
                <p className="text-[13px] font-semibold">{t.title}</p>
                <p className="my-2 text-xs text-ink-3">
                  {personName(state, t.assigneeId)} ·{" "}
                  {t.period}
                </p>
                <TaskStatusBadge status={t.status} />
              </Link>
            ))
          ) : (
            <EmptyState title="Không còn kết quả chờ nghiệm thu" />
          )}
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 flex items-center justify-between text-sm font-semibold">
            Đánh giá chờ xử lý <Badge tone="warn">{evals.length}</Badge>
          </h2>
          {evals.length ? (
            evals.map((e) => (
              <Link
                key={e.id}
                href={`/evaluation/${e.id}`}
                className="mb-2 block rounded-ctl bg-fill p-4 hover:bg-accent-50"
              >
                <p className="text-[13px] font-semibold">
                  {evaluationLabel(e, state)}
                </p>
                <p className="my-2 text-xs text-ink-3">
                  {state.periods.find((p) => p.id === e.periodId)?.name} ·{" "}
                  {e.subjectType === "PERSON" ? "Cá nhân" : "Tập thể"}
                </p>
                <EvalStatusBadge status={e.status} />
              </Link>
            ))
          ) : (
            <EmptyState title="Không còn hồ sơ chờ xử lý" />
          )}
        </Card>
      </div>
    </div>
  );
}
