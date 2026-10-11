"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ClipboardText,
  CheckCircle,
  Clock,
  ChartBar,
} from "@phosphor-icons/react";
import { useApp } from "@/lib/store";
import { scopedData } from "@/lib/exports";
import { evaluationLabel } from "@/lib/evaluation";
import { CLASS_LABELS } from "@/lib/types";
import { personName } from "@/lib/shared/names";
import {
  TASK_DONE,
  TASK_EDITABLE,
  TASK_IN_REVIEW,
  EVAL_IN_REVIEW,
  inGroup,
} from "@/lib/domain/workflow";
import { fmtDate, fmtDateTime } from "@/lib/format";
import {
  Badge,
  Card,
  EmptyState,
  EvalStatusBadge,
  Progress,
  SectionHeader,
  Select,
  StatCard,
  TaskStatusBadge,
} from "@/components/ui";
export default function DashboardPage() {
  const state = useApp();
  const { user, periods } = state;
  const scoped = scopedData(state);
  const [periodId, setPeriod] = useState(
    periods.find((p) => p.status === "ACTIVE")?.id ?? periods[0]?.id ?? "",
  );
  const period = periods.find((p) => p.id === periodId);
  const tasks = scoped.tasks.filter(
    (t) =>
      (t.periodId === periodId || t.period === period?.name) &&
      t.status !== "CANCELLED",
  );
  const evs = scoped.evaluations.filter((e) => e.periodId === periodId);
  const done = tasks.filter((t) => inGroup(TASK_DONE, t.status));
  const todoTasks = tasks.filter((t) =>
    t.assigneeId === user?.id
      ? inGroup(TASK_EDITABLE, t.status)
      : user?.role !== "cong_chuc" &&
        inGroup(TASK_IN_REVIEW, t.status),
  );
  const todoEvals = evs.filter((e) =>
    e.subjectId === user?.id
      ? e.status === "DRAFT"
      : user?.role === "lanh_dao"
        ? inGroup(EVAL_IN_REVIEW, e.status)
        : user?.role === "truong_phong" &&
          e.subjectType === "PERSON" &&
          e.status === "SUBMITTED",
  );
  const decided = evs.filter((e) => e.decision);
  const late = tasks.filter(
    (t) =>
      !inGroup(TASK_DONE, t.status) &&
      new Date(t.dueAt).getTime() < Date.now(),
  ).length;
  return (
    <div className="space-y-4">
      <SectionHeader
        title={`Xin chào, ${user?.name}`}
        hint={`${user?.departmentName ?? "Phạm vi toàn Ban"} · ${period?.range ?? "Chưa có kỳ"}`}
        actions={
          <Select
            aria-label="Kỳ tổng quan"
            value={periodId}
            onChange={(e) => setPeriod(e.target.value)}
          >
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-ctl bg-accent-50 px-4 py-3 text-xs">
        <Link
          href="/settings"
          className="flex items-center gap-1 font-medium text-accent-700"
        >
          Hướng dẫn demo <ArrowRight size={13} />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Nhiệm vụ trong kỳ"
          value={String(tasks.length)}
          sub={`${late} việc chưa hoàn thành đã quá hạn`}
          icon={<ClipboardText size={18} />}
        />
        <StatCard
          label="Đã nghiệm thu"
          value={String(done.length)}
          sub={`${tasks.length ? Math.round((done.length / tasks.length) * 100) : 0}% tổng nhiệm vụ (không gồm hủy)`}
          tone="ok"
          icon={<CheckCircle size={18} />}
        />
        <StatCard
          label="Chờ bạn xử lý"
          value={String(todoTasks.length + todoEvals.length)}
          sub="Nhiệm vụ và hồ sơ thuộc vai trò của bạn"
          tone="warn"
          icon={<Clock size={18} />}
        />
        <StatCard
          label="Đã quyết định xếp loại"
          value={`${decided.length}/${evs.length}`}
          sub="Cá nhân và tập thể có hồ sơ trong kỳ"
          icon={<ChartBar size={18} />}
        />
      </div>
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="space-y-4">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Việc cần xử lý</h2>
              <Link
                href={user?.role === "cong_chuc" ? "/tasks" : "/approvals"}
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
                        {personName(state, t.assigneeId)}{" "}
                        · Hạn {fmtDate(t.dueAt)}
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
                        {e.subjectType === "PERSON"
                          ? "Cá nhân"
                          : "Tập thể phòng"}
                      </p>
                    </div>
                    <EvalStatusBadge status={e.status} />
                  </Link>
                ))}
              </div>
            )}
          </Card>
          <Card className="p-5">
            <h2 className="mb-4 text-sm font-semibold">
              {user?.role === "cong_chuc"
                ? "Tiến độ nhiệm vụ của tôi"
                : "Tiến độ theo phòng"}
            </h2>
            <div className="space-y-5">
              {scoped.departments.map((d) => {
                const dt = tasks.filter((t) => t.departmentId === d.id);
                const dd = dt.filter((t) =>
                  inGroup(TASK_DONE, t.status),
                ).length;
                return (
                  <div key={d.id}>
                    <div className="mb-2 flex flex-wrap justify-between gap-2 text-xs">
                      <span className="font-medium">{d.name}</span>
                      <span className="text-ink-3">
                        {dd}/{dt.length} nghiệm thu
                      </span>
                    </div>
                    <Progress value={dt.length ? (dd / dt.length) * 100 : 0} />
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="mb-4 text-sm font-semibold">
              Xếp loại đã quyết định
            </h2>
            <div className="space-y-4">
              {Object.entries(CLASS_LABELS).map(([id, label]) => {
                const count = decided.filter(
                  (e) => e.decision?.classification === id,
                ).length;
                return (
                  <div key={id}>
                    <div className="mb-2 flex justify-between gap-2 text-xs">
                      <span>{label}</span>
                      <span className="font-semibold tabular-nums">
                        {count}
                      </span>
                    </div>
                    <Progress
                      value={
                        decided.length ? (count / decided.length) * 100 : 0
                      }
                    />
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-ink-3">
              Chỉ tính quyết định trong phạm vi truy cập, không tính đề xuất
              thành kết quả chính thức.
            </p>
          </Card>
          <Card className="p-5">
            <h2 className="mb-4 text-sm font-semibold">
              {user?.role === "cong_chuc"
                ? "Lộ trình demo"
                : "Hoạt động gần đây"}
            </h2>
            {user?.role === "cong_chuc" ? (
              <ol className="space-y-3 text-xs text-ink-2">
                <li>1. Mở nhiệm vụ và nhập kết quả / minh chứng.</li>
                <li>2. Nộp nghiệm thu, chờ trưởng phòng xử lý.</li>
                <li>3. Tính KPI từ nhiệm vụ được nghiệm thu.</li>
                <li>4. Gửi bản tự đánh giá kèm nhận xét.</li>
              </ol>
            ) : (
              <div className="space-y-4">
                {scoped.audit.slice(0, 5).map((a) => (
                  <div key={a.id} className="text-xs">
                    <div className="flex justify-between gap-2">
                      <p className="font-medium">{a.action}</p>
                      {a.outcome === "DENIED" && (
                        <Badge tone="danger">Từ chối</Badge>
                      )}
                    </div>
                    <p className="mt-1 break-words text-ink-3">
                      {a.resource} · {fmtDateTime(a.at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
