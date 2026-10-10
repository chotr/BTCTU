"use client";

import { LockSimple, LockSimpleOpen } from "@phosphor-icons/react";
import Link from "next/link";
import { api, perm } from "@/lib/api";
import { useApp } from "@/lib/store";
import { Avatar, Badge, Button, Card, ClassificationBadge, EvalStatusBadge, SectionHeader } from "@/components/ui";

export default function EvaluationPage() {
  const { periods, evaluations, people, departments, user } = useApp();
  const active = periods.find((p) => p.status === "ACTIVE");
  const activeEvals = evaluations.filter((e) => e.periodId === active?.id);

  return (
    <div>
      <SectionHeader
        title="Kỳ đánh giá"
        hint="Tự đánh giá → thẩm định, đề xuất → cấp có thẩm quyền quyết định (05-HD/TU + 39-QĐ/TU)"
        actions={
          active && perm.canLock(user) ? (
            <Button variant="danger" icon={<LockSimple size={14} weight="bold" />} onClick={() => api.lockPeriod(active.id)}>
              Khóa kỳ {active.name}
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {periods.map((p) => (
          <Card key={p.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[14px] font-semibold">{p.name}</h2>
                  {p.status === "LOCKED" ? <Badge tone="neutral">Đã khóa</Badge> : <Badge tone="accent">Đang mở</Badge>}
                </div>
                <p className="mt-1 text-[12px] text-ink-3">{p.range}</p>
              </div>
              {p.status === "LOCKED" ? <LockSimple size={18} className="text-ink-3" /> : <LockSimpleOpen size={18} className="text-accent-600" />}
            </div>
            <p className="mt-3 text-[11px] text-ink-3">
              {evaluations.filter((e) => e.periodId === p.id).length} đối tượng trong kỳ
            </p>
          </Card>
        ))}
      </div>

      <h2 className="mb-2 mt-6 text-[14px] font-semibold">Đối tượng kỳ {active?.name}</h2>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-[13px]">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-ink-3">
              <th className="px-3 py-2.5">Người đánh giá</th>
              <th className="px-3 py-2.5">Phòng</th>
              <th className="px-3 py-2.5">Nhóm công thức</th>
              <th className="px-3 py-2.5">Tổng điểm</th>
              <th className="px-3 py-2.5">Xếp loại</th>
              <th className="px-3 py-2.5">Trạng thái</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {activeEvals.map((e) => {
              const subject = people.find((p) => p.id === e.subjectId);
              const dept = departments.find((d) => d.id === e.departmentId);
              const cls = e.decision?.classification ?? e.review?.proposed ?? e.self?.proposed;
              return (
                <tr key={e.id} className="transition-colors hover:bg-fill">
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-2">
                      <Avatar name={subject?.name ?? "?"} size="sm" />
                      <span className="font-medium">{subject?.name}</span>
                      {subject?.id === user?.id ? <Badge tone="accent">Bạn</Badge> : null}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-ink-2">{dept?.shortName}</td>
                  <td className="px-3 py-2.5 text-ink-2">{e.isLeader ? "A/B/C/D (lãnh đạo)" : "A/B/C (ứng viên)"}</td>
                  <td className="px-3 py-2.5 font-semibold">{e.calc.textTotal}</td>
                  <td className="px-3 py-2.5">{cls ? <ClassificationBadge value={cls} /> : <span className="text-ink-3">—</span>}</td>
                  <td className="px-3 py-2.5"><EvalStatusBadge status={e.status} /></td>
                  <td className="px-3 py-2.5 text-right">
                    <Link href={"/evaluation/" + e.id} className="text-[12px] font-medium text-accent-600 hover:underline">
                      Mở
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

