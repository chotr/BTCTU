"use client";

import { ArrowRight, ChartLineUp, CheckCircle, ClipboardText, Clock, WarningCircle } from "@phosphor-icons/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { fmtDate, fmtDateTime, fmtNum } from "@/lib/format";
import { useApp } from "@/lib/store";
import {
  Avatar,
  Badge,
  Callout,
  Card,
  Progress,
  SectionHeader,
  StatCard,
  TaskStatusBadge,
} from "@/components/ui";

export default function DashboardPage() {
  const { user, tasks, departments, evaluations, people, audit, periods } = useApp();
  if (!user) return null;

  const activePeriod = periods.find((p) => p.status === "ACTIVE");
  const activeEvals = evaluations.filter((e) => e.periodId === activePeriod?.id);
  const submitted = tasks.filter((t) => t.status === "SUBMITTED").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS" || t.status === "ASSIGNED").length;
  const decided = activeEvals.filter((e) => e.status === "APPROVED" || e.status === "LOCKED").length;
  const pendingDecision = evaluations.filter((e) => e.status === "REVIEWED").length;
  const pendingReview = evaluations.filter(
    (e) => e.status === "SUBMITTED" && user.role === "truong_phong" && e.departmentId === user.departmentId,
  ).length;

  const myTasks = user.role === "cong_chuc" ? tasks.filter((t) => t.assigneeId === user.id && t.status !== "ACCEPTED" && t.status !== "LOCKED") : [];

  return (
    <div>
      <SectionHeader
        title={`Xin chào, ${user.name}`}
        hint={activePeriod ? `Kỳ đánh giá ${activePeriod.name} · ${activePeriod.range}` : undefined}
      />

      <Callout tone="accent" icon={<WarningCircle size={16} />} title="Bản demo chạy hoàn toàn bằng dữ liệu minh họa">
        UI đầy đủ luồng nghiệp vụ trong kế hoạch; API thật sẽ nối sau. Các con số KPI bám ví dụ 05-HD/TU, gồm cả mâu thuẫn số học
        INC-01 được hiển thị công khai thay vì tự sửa nguồn.
      </Callout>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Nhiệm vụ đang thực hiện" value={fmtNum(inProgress)} sub={`Chờ nghiệm thu: ${fmtNum(submitted)}`} icon={<ClipboardText size={15} weight="bold" />} />
        <StatCard label="Bản tự đánh giá đã nộp" value={fmtNum(activeEvals.filter((e) => e.status !== "DRAFT").length)} sub={`Tổng ${fmtNum(activeEvals.length)} đối tượng kỳ này`} icon={<ChartLineUp size={15} weight="bold" />} tone="ok" />
        <StatCard label="Đã quyết định xếp loại" value={fmtNum(decided)} sub="Bao gồm các bản đã khóa kỳ" icon={<CheckCircle size={15} weight="bold" />} tone="accent" />
        <StatCard label="Chờ xử lý của bạn" value={fmtNum(user.role === "lanh_dao" ? pendingDecision : user.role === "truong_phong" ? pendingReview : myTasks.length)} sub={user.role === "lanh_dao" ? "Hồ sơ chờ quyết định xếp loại" : user.role === "truong_phong" ? "Hồ sơ chờ thẩm định" : "Nhiệm vụ cần cập nhật"} icon={<Clock size={15} weight="bold" />} tone="warn" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold">Tiến độ theo phòng</h2>
              <Link href="/tasks" className="flex items-center gap-1 text-[12px] font-medium text-accent-600 hover:underline">
                Xem công việc <ArrowRight size={12} weight="bold" />
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              {departments.map((d) => {
                const deptTasks = tasks.filter((t) => t.departmentId === d.id);
                const done = deptTasks.filter((t) => t.status === "ACCEPTED" || t.status === "LOCKED").length;
                const pct = deptTasks.length ? Math.round((done / deptTasks.length) * 100) : 0;
                return (
                  <div key={d.id}>
                    <div className="mb-1 flex items-center justify-between text-[12px]">
                      <span className="font-medium">{d.name}</span>
                      <span className="text-ink-3">
                        {done}/{deptTasks.length} nhiệm vụ nghiệm thu
                      </span>
                    </div>
                    <Progress value={pct} />
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="mb-3 text-[14px] font-semibold">Việc cần xử lý</h2>
            <TodoList />
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="p-4">
            <h2 className="mb-3 text-[14px] font-semibold">Phân bố xếp loại quý</h2>
            <DistributionBars />
          </Card>

          <Card className="p-4">
            <h2 className="mb-3 text-[14px] font-semibold">Hoạt động gần đây</h2>
            <div className="flex flex-col gap-3">
              {audit.slice(0, 6).map((a) => {
                const actor = people.find((p) => p.id === a.actorId);
                return (
                  <div key={a.id} className="flex items-start gap-2.5">
                    <Avatar name={actor?.name ?? "?"} size="sm" />
                    <div className="min-w-0">
                      <p className="text-[12px] leading-snug">
                        <span className="font-semibold">{actor?.name ?? "?"}</span>{" "}
                        <span className="text-ink-2">{a.action}</span>{" "}
                        <span className="font-medium">{a.resource}</span>
                      </p>
                      <p className="text-[11px] text-ink-3">{fmtDateTime(a.at)}</p>
                    </div>
                    {a.outcome === "DENIED" ? <Badge tone="danger">Từ chối</Badge> : null}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TodoList() {
  const { user, tasks, evaluations, people, departments } = useApp();
  if (!user) return null;

  const rows: { href: string; title: string; meta: string; badge: ReactNode }[] = [];

  if (user.role === "cong_chuc") {
    for (const t of tasks.filter((x) => x.assigneeId === user.id && ["ASSIGNED", "IN_PROGRESS", "RETURNED"].includes(x.status))) {
      rows.push({ href: "/tasks/" + t.id, title: t.title, meta: "Hạn " + fmtDate(t.dueAt), badge: <TaskStatusBadge status={t.status} /> });
    }
    const myEval = evaluations.find((e) => e.subjectId === user.id && e.status === "DRAFT");
    if (myEval) {
      rows.push({ href: "/evaluation/" + myEval.id, title: "Nộp bản tự đánh giá quý III", meta: "Bản nháp đang chờ hoàn thiện", badge: <Badge tone="warn">Cần nộp</Badge> });
    }
  }

  if (user.role === "truong_phong") {
    for (const t of tasks.filter((x) => x.status === "SUBMITTED" && x.departmentId === user.departmentId)) {
      rows.push({ href: "/tasks/" + t.id, title: t.title, meta: "Chờ nghiệm thu", badge: <TaskStatusBadge status={t.status} /> });
    }
    for (const e of evaluations.filter((x) => x.status === "SUBMITTED" && x.departmentId === user.departmentId)) {
      const subject = people.find((p) => p.id === e.subjectId);
      rows.push({ href: "/evaluation/" + e.id, title: "Thẩm định đánh giá của " + (subject?.name ?? "?"), meta: "Chờ nhận xét, đề xuất mức", badge: <Badge tone="warn">Chờ thẩm định</Badge> });
    }
  }

  if (user.role === "lanh_dao") {
    for (const e of evaluations.filter((x) => x.status === "REVIEWED")) {
      const subject = people.find((p) => p.id === e.subjectId);
      const dept = departments.find((d) => d.id === e.departmentId);
      rows.push({ href: "/evaluation/" + e.id, title: "Quyết định xếp loại cho " + (subject?.name ?? "?"), meta: dept?.name ?? "", badge: <Badge tone="accent">Chờ quyết định</Badge> });
    }
    for (const t of tasks.filter((x) => x.status === "SUBMITTED")) {
      rows.push({ href: "/tasks/" + t.id, title: t.title, meta: "Chờ nghiệm thu cấp phòng", badge: <TaskStatusBadge status={t.status} /> });
    }
  }

  if (rows.length === 0) {
    return <p className="py-6 text-center text-[12px] text-ink-3">Không còn việc chờ xử lý. Mọi thứ đã theo đúng luồng.</p>;
  }

  return (
    <div className="flex flex-col">
      {rows.map((r, i) => (
        <Link key={i} href={r.href} className="flex items-center justify-between gap-3 rounded-card px-2 py-2.5 transition-colors hover:bg-fill">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium">{r.title}</p>
            <p className="text-[11px] text-ink-3">{r.meta}</p>
          </div>
          {r.badge}
        </Link>
      ))}
    </div>
  );
}

function DistributionBars() {
  const { evaluations, periods } = useApp();
  const active = periods.find((p) => p.status === "ACTIVE");
  const evals = evaluations.filter((e) => e.periodId === active?.id);
  const order = ["XUAT_SAC", "TOT", "HOAN_THANH", "KHONG_HOAN_THANH"] as const;
  const labels: Record<string, string> = {
    XUAT_SAC: "Xuất sắc",
    TOT: "Tốt",
    HOAN_THANH: "Hoàn thành",
    KHONG_HOAN_THANH: "Không hoàn thành",
  };
  const decided = evals.filter((e) => e.decision).map((e) => e.decision!.classification);
  const decidedCount = decided.length;

  return (
    <div className="flex flex-col gap-3">
      {order.map((cls) => {
        const count = decided.filter((d) => d === cls).length;
        const pct = decidedCount ? Math.round((count / decidedCount) * 100) : 0;
        return (
          <div key={cls} className="flex items-center gap-2">
            <span className="w-24 shrink-0 text-[12px] text-ink-2">{labels[cls]}</span>
            <div className="h-2 flex-1 rounded-pill bg-fill-2">
              <div
                className={
                  "h-full rounded-pill " +
                  (cls === "XUAT_SAC" ? "bg-ok-600" : cls === "TOT" ? "bg-accent-600" : cls === "HOAN_THANH" ? "bg-warn-600" : "bg-danger-600")
                }
                style={{ width: pct + "%" }}
              />
            </div>
            <span className="w-8 text-right text-[12px] font-semibold">{count}</span>
          </div>
        );
      })}
      <p className="text-[11px] text-ink-3">Dựa trên các bản đã quyết định trong kỳ · dữ liệu minh họa</p>
    </div>
  );
}
