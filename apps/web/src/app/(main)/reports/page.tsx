"use client";
import Link from "next/link";
import { useState } from "react";
import { Export, Printer, FileText } from "@phosphor-icons/react";
import { appendAudit, useApp } from "@/lib/store";
import { exportReport, scopedData } from "@/lib/exports";
import { evaluationLabel, evaluationTotal } from "@/lib/evaluation";
import { CLASS_LABELS } from "@/lib/types";
import {
  TASK_DONE,
  TASK_EDITABLE,
  TASK_IN_REVIEW,
  inGroup,
} from "@/lib/domain/workflow";
import {
  Badge,
  Button,
  Card,
  ClassificationBadge,
  EmptyState,
  Field,
  SectionHeader,
  Select,
  StatCard,
} from "@/components/ui";
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
      `DỰ THẢO MINH HỌA — KHÔNG CÓ GIÁ TRỊ QUYẾT ĐỊNH\nBáo cáo kết quả ${period?.name}\nPhạm vi: ${dept === "ALL" ? "theo quyền tài khoản" : state.departments.find((d) => d.id === dept)?.name}\n\n1. Thực hiện nhiệm vụ\nCó ${tasks.length} nhiệm vụ (không tính nhiệm vụ hủy), ${done.length} nhiệm vụ được nghiệm thu.\n\n2. Đánh giá, xếp loại\n${decided.length}/${evs.length} hồ sơ có quyết định mô phỏng.\n${Object.entries(
        CLASS_LABELS,
      )
        .map(
          ([key, label]) =>
            `${label}: ${decided.filter((e) => e.decision?.classification === key).length}`,
        )
        .join(
          "\n",
        )}\n\n3. Nội dung cần rà soát\nĐối chiếu thẩm quyền, điều kiện QĐ39; quy tắc ứng viên chưa được phê duyệt chính thức. Kiểm tra nguồn và căn cứ từng hồ sơ trước khi sử dụng.\n\nNgười rà soát: ................................`,
    );
    appendAudit({
      actorId: state.user!.id,
      action: "Tạo dự thảo báo cáo",
      resource: periodId,
      detail:
        "Mẫu xác định từ dữ liệu tổng hợp; không AI, không tự ký/ban hành",
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
        hint="Dữ liệu mô phỏng — chỉ tổng hợp trong phạm vi quyền của tài khoản."
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
        DỮ LIỆU MÔ PHỎNG — {period?.name} — người xuất: {state.user?.name}
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
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-[13px]">
          <thead className="bg-fill text-left text-xs text-ink-3">
            <tr>
              {[
                "Phòng",
                "Tổng việc",
                "Đang làm / trả lại",
                "Chờ nghiệm thu",
                "Đã nghiệm thu",
              ].map((h) => (
                <th key={h} className="p-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scoped.departments
              .filter((d) => dept === "ALL" || d.id === dept)
              .map((d) => {
                const ts = tasks.filter((t) => t.departmentId === d.id);
                return (
                  <tr key={d.id} className="shadow-[0_1px_0_#edf1f6]">
                    <td className="p-3 font-medium">{d.shortName}</td>
                    <td className="p-3">{ts.length}</td>
                    <td className="p-3">
                      {
                        ts.filter((t) =>
                          inGroup(TASK_EDITABLE,
                            t.status,
                          ),
                        ).length
                      }
                    </td>
                    <td className="p-3">
                      {
                        ts.filter((t) =>
                          inGroup(TASK_IN_REVIEW, t.status),
                        ).length
                      }
                    </td>
                    <td className="p-3">
                      {
                        ts.filter((t) =>
                          inGroup(TASK_DONE, t.status),
                        ).length
                      }
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </Card>
      <Card className="overflow-x-auto">
        <h2 className="p-4 text-sm font-semibold">Truy vết kết quả đánh giá</h2>
        {evs.length ? (
          <table className="w-full min-w-[760px] text-[13px]">
            <thead className="bg-fill text-left text-xs text-ink-3">
              <tr>
                {[
                  "Đối tượng",
                  "Điểm ứng viên",
                  "Quyết định",
                  "Nguồn / phiên bản",
                ].map((h) => (
                  <th key={h} className="p-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {evs.map((e) => (
                <tr key={e.id} className="shadow-[0_1px_0_#edf1f6]">
                  <td className="p-3">
                    <Link
                      href={`/evaluation/${e.id}`}
                      className="font-medium text-accent-700 hover:underline"
                    >
                      {evaluationLabel(e, state)}
                    </Link>
                  </td>
                  <td className="p-3 tabular-nums">
                    {evaluationTotal(e).toFixed(2)}
                    {!e.calculationRuns?.length && (
                      <span className="ml-1 text-xs text-ink-3">(mẫu)</span>
                    )}
                  </td>
                  <td className="p-3">
                    {e.decision ? (
                      <ClassificationBadge value={e.decision.classification} />
                    ) : (
                      <Badge>Chưa quyết định</Badge>
                    )}
                  </td>
                  <td className="max-w-xs p-3 text-xs text-ink-3">
                    {e.calc.ruleVersion}
                    <p className="mt-1">
                      05-HD/TU → KPI ứng viên → QĐ39 / điều kiện → quyết định
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState title="Chưa có hồ sơ trong phạm vi đã chọn" />
        )}
      </Card>
      {draft !== null && (
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold">
            Dự thảo báo cáo · cần người rà soát
          </h2>
          <textarea
            aria-label="Dự thảo báo cáo"
            className="control min-h-96 w-full py-3 text-[13px] leading-relaxed print:hidden"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <pre className="hidden whitespace-pre-wrap font-sans text-sm leading-relaxed print:block">
            {draft}
          </pre>
          <p className="mt-3 text-xs text-ink-3 print:hidden">
            Chỉnh sửa trực tiếp, sau đó chọn In / lưu PDF. Không có thao tác ký
            hoặc ban hành tự động.
          </p>
        </Card>
      )}
    </div>
  );
}
