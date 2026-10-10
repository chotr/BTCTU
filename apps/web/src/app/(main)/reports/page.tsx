"use client";

import { Export } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { fmtNum } from "@/lib/format";
import { useApp } from "@/lib/store";
import { Badge, Button, Card, SectionHeader, Select, StatCard } from "@/components/ui";

export default function ReportsPage() {
  const { periods, tasks, departments, evaluations } = useApp();
  const [periodId, setPeriodId] = useState(periods.find((p) => p.status === "ACTIVE")?.id ?? periods[0]?.id ?? "");

  const periodTasks = useMemo(() => tasks.filter((t) => t.period === periods.find((p) => p.id === periodId)?.name), [tasks, periods, periodId]);
  const total = periodTasks.length;
  const done = periodTasks.filter((t) => t.status === "ACCEPTED" || t.status === "LOCKED").length;
  const submitted = periodTasks.filter((t) => t.status === "SUBMITTED").length;
  const onTime = Math.round(total ? (done / total) * 100 : 0);

  const decided = evaluations.filter((e) => e.periodId === periodId && e.decision).map((e) => e.decision!.classification);
  const count = (cls: string) => decided.filter((d) => d === cls).length;

  return (
    <div>
      <SectionHeader
        title="Báo cáo"
        hint="Số liệu tổng hợp minh họa · dữ liệu chỉ hiển thị trong phạm vi quyền của tài khoản"
        actions={
          <Button variant="primary" icon={<Export size={14} weight="bold" />} onClick={() => api.exportReport("Báo cáo quý")}>
            Xuất báo cáo
          </Button>
        }
      />

      <Card className="mb-4 flex items-center gap-3 p-3">
        <span className="text-[12px] font-medium text-ink-2">Kỳ báo cáo</span>
        <Select className="w-48" value={periodId} onChange={(e) => setPeriodId(e.target.value)}>
          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tổng nhiệm vụ" value={fmtNum(total)} sub="Trong kỳ báo cáo" />
        <StatCard label="Đã nghiệm thu" value={fmtNum(done)} sub={fmtNum(submitted) + " đang chờ nghiệm thu"} tone="ok" />
        <StatCard label="Tỷ lệ hoàn thành" value={onTime + "%"} sub="Trên tổng nhiệm vụ kỳ" tone="accent" />
        <StatCard label="Đã quyết định xếp loại" value={fmtNum(decided.length)} sub="Cá nhân có quyết định cuối" tone="warn" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="p-4 xl:col-span-2">
          <h2 className="mb-3 text-[14px] font-semibold">Tình hình theo phòng</h2>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-ink-3">
                <th className="px-3 py-2">Phòng</th>
                <th className="px-3 py-2">Tổng</th>
                <th className="px-3 py-2">Đang thực hiện</th>
                <th className="px-3 py-2">Chờ nghiệm thu</th>
                <th className="px-3 py-2">Nghiệm thu</th>
                <th className="px-3 py-2">Hoàn thành</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => {
                const dt = periodTasks.filter((t) => t.departmentId === d.id);
                const dd = dt.filter((t) => t.status === "ACCEPTED" || t.status === "LOCKED").length;
                return (
                  <tr key={d.id} className="transition-colors hover:bg-fill">
                    <td className="px-3 py-2.5 font-medium">{d.shortName}</td>
                    <td className="px-3 py-2.5">{dt.length}</td>
                    <td className="px-3 py-2.5">{dt.filter((t) => t.status === "ASSIGNED" || t.status === "IN_PROGRESS" || t.status === "RETURNED").length}</td>
                    <td className="px-3 py-2.5">{dt.filter((t) => t.status === "SUBMITTED").length}</td>
                    <td className="px-3 py-2.5">{dt.filter((t) => t.status === "REVIEWED").length}</td>
                    <td className="px-3 py-2.5 font-semibold">{Math.round(dt.length ? (dd / dt.length) * 100 : 0)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 text-[14px] font-semibold">Xếp loại kỳ</h2>
          <div className="flex flex-col gap-2 text-[13px]">
            <DistRow label="Xuất sắc" value={count("XUAT_SAC")} tone="ok" />
            <DistRow label="Tốt" value={count("TOT")} tone="accent" />
            <DistRow label="Hoàn thành" value={count("HOAN_THANH")} tone="warn" />
            <DistRow label="Không hoàn thành" value={count("KHONG_HOAN_THANH")} tone="danger" />
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-ink-3">
            Phân bố chỉ gồm các bản đã có quyết định. Việc tự động hóa hạn mức Xuất sắc theo nhóm so sánh vẫn là TBD (QĐ39).
          </p>
        </Card>
      </div>
    </div>
  );
}

function DistRow({ label, value, tone }: { label: string; value: number; tone: "ok" | "accent" | "warn" | "danger" }) {
  return (
    <div className="flex items-center justify-between rounded-card bg-fill px-3 py-2">
      <span className="text-ink-2">{label}</span>
      <Badge tone={tone}>{value}</Badge>
    </div>
  );
}

