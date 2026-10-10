"use client";

import { CheckCircle } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { Badge, Card, EmptyState, SectionHeader } from "@/components/ui";

export default function ApprovalsPage() {
  const { user, evaluations, tasks, people, departments } = useApp();
  if (!user) return null;

  const reviewQueue =
    user.role === "lanh_dao"
      ? evaluations.filter((e) => e.status === "SUBMITTED")
      : user.role === "truong_phong"
        ? evaluations.filter((e) => e.status === "SUBMITTED" && e.departmentId === user.departmentId)
        : [];

  const decisionQueue =
    user.role === "lanh_dao" ? evaluations.filter((e) => e.status === "REVIEWED") : [];

  const taskQueue =
    user.role === "cong_chuc"
      ? []
      : tasks.filter((t) => t.status === "SUBMITTED" && (user.role === "lanh_dao" || t.departmentId === user.departmentId));

  return (
    <div>
      <SectionHeader title="Xử lý & phê duyệt" hint="Hàng đợi được lọc theo vai trò và phạm vi dữ liệu của tài khoản đang đăng nhập" />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <QueueCard
          title="Chờ thẩm định, đề xuất mức"
          hint="Bản tự đánh giá đã nộp, cần người có thẩm quyền trực tiếp nhận xét"
          empty="Không có bản đánh giá chờ thẩm định."
        >
          {reviewQueue.map((e) => {
            const subject = people.find((p) => p.id === e.subjectId);
            const dept = departments.find((d) => d.id === e.departmentId);
            return (
              <QueueRow key={e.id} href={"/evaluation/" + e.id} title={(subject?.name ?? "?") + " — " + (dept?.shortName ?? "")} meta={"Tự đề xuất: " + (e.self?.proposed ?? "—")} badge={<Badge tone="warn">Chờ thẩm định</Badge>} />
            );
          })}
        </QueueCard>

        <QueueCard
          title="Chờ quyết định xếp loại"
          hint="Đã thẩm định và đề xuất, chờ cấp có thẩm quyền quyết định"
          empty="Không có hồ sơ chờ quyết định."
        >
          {decisionQueue.map((e) => {
            const subject = people.find((p) => p.id === e.subjectId);
            return (
              <QueueRow key={e.id} href={"/evaluation/" + e.id} title={(subject?.name ?? "?") + " — đã thẩm định"} meta={"Đề xuất: " + (e.review?.proposed ?? "—")} badge={<Badge tone="accent">Chờ quyết định</Badge>} />
            );
          })}
        </QueueCard>
      </div>

      <div className="mt-4">
        <QueueCard title="Kết quả công việc chờ nghiệm thu" hint="Nhiệm vụ đã nộp kết quả trong phạm vi quyền" empty="Không có kết quả chờ nghiệm thu.">
          {taskQueue.map((t) => {
            const assignee = people.find((p) => p.id === t.assigneeId);
            return (
              <QueueRow key={t.id} href={"/tasks/" + t.id} title={t.title} meta={"Người thực hiện: " + (assignee?.name ?? "?")} badge={<Badge tone="warn">Chờ nghiệm thu</Badge>} />
            );
          })}
        </QueueCard>
      </div>
    </div>
  );
}

function QueueCard({ title, hint, empty, children }: { title: string; hint: string; empty: string; children: ReactNode }) {
  return (
    <Card className="p-4">
      <h2 className="text-[14px] font-semibold">{title}</h2>
      <p className="mt-0.5 text-[11px] text-ink-3">{hint}</p>
      <div className="mt-3 flex flex-col">
        {Array.isArray(children) && children.length === 0 ? (
          <EmptyState icon={<CheckCircle size={16} />} title={empty} />
        ) : (
          children
        )}
      </div>
    </Card>
  );
}

function QueueRow({ href, title, meta, badge }: { href: string; title: string; meta: string; badge: ReactNode }) {
  return (
    <Link href={href} className="flex items-center justify-between gap-3 rounded-card px-2 py-2.5 transition-colors hover:bg-fill">
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium">{title}</p>
        <p className="text-[11px] text-ink-3">{meta}</p>
      </div>
      {badge}
    </Link>
  );
}
