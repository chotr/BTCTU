"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ClipboardText,
  CheckCircle,
  Clock,
  ChartBar,
} from "@phosphor-icons/react";
import { useApp } from "@/lib/store";
import { scopedData } from "@/lib/access";
import {
  TASK_DONE,
  TASK_EDITABLE,
  TASK_IN_REVIEW,
  EVAL_IN_REVIEW,
  inGroup,
} from "@/lib/domain/workflow";
import { SectionHeader, Select, StatCard } from "@/components/ui";
import {
  ActivityPanel,
  ClassificationDistribution,
  DepartmentProgress,
  TodoList,
} from "@/components/dashboard";
import { ROLES } from "@/lib/types";

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
      : user?.role !== ROLES.congChuc && inGroup(TASK_IN_REVIEW, t.status),
  );
  const todoEvals = evs.filter((e) =>
    e.subjectId === user?.id
      ? e.status === "DRAFT"
      : user?.role === ROLES.lanhDao
        ? inGroup(EVAL_IN_REVIEW, e.status)
        : user?.role === ROLES.truongPhong &&
          e.subjectType === "PERSON" &&
          e.status === "SUBMITTED",
  );
  const decided = evs.filter((e) => e.decision);
  const late = tasks.filter(
    (t) =>
      !inGroup(TASK_DONE, t.status) && new Date(t.dueAt).getTime() < Date.now(),
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
          label="Chờ xử lý"
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
          <TodoList
            todoTasks={todoTasks}
            todoEvals={todoEvals}
            state={state}
            role={user?.role}
          />
          <DepartmentProgress
            departments={scoped.departments}
            tasks={tasks}
            role={user?.role}
          />
        </div>
        <div className="space-y-4">
          <ClassificationDistribution decided={decided} />
          <ActivityPanel role={user?.role} audit={scoped.audit} />
        </div>
      </div>
    </div>
  );
}
