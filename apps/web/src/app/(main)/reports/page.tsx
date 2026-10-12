"use client";

import { useState } from "react";
import { Export, Printer, FileText } from "@phosphor-icons/react";
import { appendAudit, useApp } from "@/lib/store";
import { exportReport, scopedData } from "@/lib/exports";
import { CLASS_LABELS } from "@/lib/types";
import { TASK_DONE, inGroup } from "@/lib/domain/workflow";
import {
  Button,
  Card,
  Field,
  SectionHeader,
  Select,
  StatCard,
} from "@/components/ui";
import {
  DepartmentProgressTable,
  EvaluationTraceTable,
  ReportDraft,
} from "@/components/reports";

export default function ReportsPage() {
  const state = useApp();
  const scoped = scopedData(state);
  const [periodId, setPeriod] = useState(state.periods[0]?.id ?? "");
  const [dept, setDept] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [draft, setDraft] = useState<string | null>(null);
  const period = state.periods.find((p) => p.id === periodId);
  const tasks = scoped.tasks.filter(
    (t) =>
      (t.periodId === periodId || t.period === period?.name) &&
      (dept === "ALL" || t.departmentId === dept) &&
      t.status !== "CANCELLED",
  );
  const evs = scoped.evaluations.filter(
    (e) =>
      e.periodId === periodId &&
      (dept === "ALL" || e.departmentId === dept) &&
      (type === "ALL" || e.subjectType === type),
  );
  const done = tasks.filter((t) => inGroup(TASK_DONE, t.status));
  const decided = evs.filter((e) => e.decision);
  function makeDraft() {
    setDraft(
      `DỰ THẢO — CẦN RÀ SOÁT TRƯỚC KHI BAN HÀNH\nBáo cáo kết quả ${period?.name}\nPhạm vi: ${dept === "ALL" ? "theo quyền tài khoản" : state.departments.find((d) => d.id === dept)?.name}\n\n1. Thực hiện nhiệm vụ\nCó ${tasks.length} nhiệm vụ (không tính nhiệm vụ hủy), ${done.length} nhiệm vụ được nghiệm thu.\n\n2. Đánh giá, xếp loại\n${decided.length}/${evs.length} hồ sơ có quyết định.\n${Object.entries(
        CLASS_LABELS,
      )
        .map(
          ([key, label]) =>
            `${label}: ${decided.filter((e) => e.decision?.classification === key).length}`,
        )
        .join(
          "\n",
        )}\n\n3. Nội dung cần rà soát\nĐối chiếu thẩm quyền, điều kiện QĐ39 và các quy tắc đang chờ phê duyệt. Kiểm tra nguồn và căn cứ từng hồ sơ trước khi sử dụng.\n\nNgười rà soát: ................................`,
    );
    appendAudit({
      actorId: state.user!.id,
      action: "Tạo dự thảo báo cáo",
      resource: periodId,
      detail: "Mẫu xác định từ dữ liệu tổng hợp; không AI, không tự ký/ban hành",
      outcome: "OK",
    });
  }
  function print() {
    appendAudit({
      actorId: state.user!.id,
      action: "In / lưu PDF",
      resource: periodId,
      detail: `Phạm vi ${dept}; loại ${type}; dữ liệu synthetic`,
      outcome: "OK",
    });
    window.print();
  }
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Báo cáo điều hành"
        hint="Dữ liệu được tổng hợp trong phạm vi quyền của tài khoản."
        actions={
          <div className="flex flex-wrap gap-2 print:hidden">
            <Button
              icon={<Export size={15} />}
              onClick={() => exportReport("tasks", periodId, dept)}
            >
              CSV nhiệm vụ
            </Button>
            <Button
              icon={<Export size={15} />}
              onClick={() => exportReport("evaluations", periodId, dept, type)}
            >
              CSV đánh giá
            </Button>
            <Button icon={<Printer size={15} />} onClick={print}>
              In / lưu PDF
            </Button>
          </div>
        }
      />
      <Card className="flex flex-wrap items-end gap-3 p-3 print:hidden">
        <Field label="Kỳ báo cáo">
          <Select
            value={periodId}
            onChange={(e) => {
              setPeriod(e.target.value);
              setDraft(null);
            }}
          >
            {state.periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Đơn vị">
          <Select
            value={dept}
            onChange={(e) => {
              setDept(e.target.value);
              setDraft(null);
            }}
          >
            <option value="ALL">Trong phạm vi của tôi</option>
            {scoped.departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.shortName}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Nhóm đánh giá">
          <Select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setDraft(null);
            }}
          >
            <option value="ALL">Cá nhân & tập thể</option>
            <option value="PERSON">Cá nhân</option>
            <option value="DEPARTMENT">Tập thể</option>
          </Select>
        </Field>
        <Button icon={<FileText size={16} />} onClick={makeDraft}>
          Soạn dự thảo
        </Button>
      </Card>
      <p className="hidden text-xs print:block">
        {period?.name} — người xuất: {state.user?.name}
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Nhiệm vụ" value={String(tasks.length)} />
        <StatCard label="Đã nghiệm thu" value={String(done.length)} tone="ok" />
        <StatCard
          label="Tỷ lệ hoàn thành"
          value={`${tasks.length ? Math.round((done.length / tasks.length) * 100) : 0}%`}
        />
        <StatCard
          label="Đã quyết định"
          value={`${decided.length}/${evs.length}`}
          tone="warn"
        />
      </div>
      <DepartmentProgressTable
        departments={scoped.departments}
        tasks={tasks}
        dept={dept}
      />
      <EvaluationTraceTable evaluations={evs} state={state} />
      {draft !== null && <ReportDraft value={draft} onChange={setDraft} />}
    </div>
  );
}
