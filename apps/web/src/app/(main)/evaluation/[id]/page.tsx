"use client";

import { ArrowLeft, ArrowUUpLeft, Check, Gavel, LockSimple, WarningCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { api, perm } from "@/lib/api";
import { fmtDateTime, fmtNum } from "@/lib/format";
import { useApp } from "@/lib/store";
import {
  Avatar,
  Badge,
  Button,
  Callout,
  Card,
  ClassificationBadge,
  EvalStatusBadge,
  Field,
  Progress,
  SectionHeader,
} from "@/components/ui";
import type { Classification, EvalStatus } from "@/lib/types";

const steps: EvalStatus[] = ["DRAFT", "SUBMITTED", "REVIEWED", "APPROVED", "LOCKED"];

export default function EvaluationDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? String(params.id[0]) : String(params.id);
  const { evaluations, people, departments, periods, user } = useApp();
  const ev = evaluations.find((e) => e.id === id);

  const [selfComment, setSelfComment] = useState("");
  const [selfProposed, setSelfProposed] = useState<Classification>("TOT");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewProposed, setReviewProposed] = useState<Classification>("TOT");
  const [decisionCls, setDecisionCls] = useState<Classification>("TOT");
  const [decisionNote, setDecisionNote] = useState("");

  if (!ev || !user) {
    return (
      <div>
        <SectionHeader title="Không tìm thấy bản đánh giá" />
        <Link href="/evaluation" className="text-[13px] font-medium text-accent-600 hover:underline">
          ← Quay lại kỳ đánh giá
        </Link>
      </div>
    );
  }

  const subject = people.find((p) => p.id === ev.subjectId);
  const dept = departments.find((d) => d.id === ev.departmentId);
  const period = periods.find((p) => p.id === ev.periodId);
  const stepIndex = steps.indexOf(ev.status);
  const isSubject = ev.subjectId === user.id;
  const canReview = perm.canReviewEvaluation(user, ev.departmentId) && ev.status === "SUBMITTED";
  const canDecide = perm.canDecide(user) && ev.status === "REVIEWED";
  const cls = ev.decision?.classification ?? ev.review?.proposed ?? ev.self?.proposed ?? null;

  return (
    <div>
      <div className="mb-3">
        <Link href="/evaluation" className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-3 transition-colors hover:text-accent-600">
          <ArrowLeft size={14} weight="bold" /> Kỳ đánh giá
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={subject?.name ?? "?"} size="lg" />
          <div>
            <h1 className="text-[17px] font-semibold">{subject?.name}</h1>
            <p className="text-[12px] text-ink-3">
              {dept?.name} · {period?.name} · {period?.range}
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <EvalStatusBadge status={ev.status} />
              {cls ? <ClassificationBadge value={cls} /> : null}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <span
                className={
                  i < stepIndex
                    ? "flex h-6 items-center rounded-pill bg-ok-600 px-2 text-[10px] font-semibold text-white"
                    : i === stepIndex
                      ? "flex h-6 items-center rounded-pill bg-accent-600 px-2 text-[10px] font-semibold text-white"
                      : "flex h-6 items-center rounded-pill bg-fill-2 px-2 text-[10px] font-medium text-ink-3"
                }
              >
                {i + 1}. {s === "DRAFT" ? "Nháp" : s === "SUBMITTED" ? "Tự đánh giá" : s === "REVIEWED" ? "Thẩm định" : s === "APPROVED" ? "Quyết định" : "Khóa kỳ"}
              </span>
              {i < steps.length - 1 ? <span className="h-px w-2 bg-fill-2" /> : null}
            </div>
          ))}
        </div>
      </div>

      {ev.calc.note ? (
        <div className="mt-4">
          <Callout tone="warn" icon={<WarningCircle size={16} />} title="Mâu thuẫn nguồn được ghi nhận công khai">
            {ev.calc.note} — hệ thống không tự ý sửa nguồn; đây là điểm cần nói khi bảo vệ dự án.
          </Callout>
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          <Card className="p-4">
            <h2 className="mb-3 text-[14px] font-semibold">Cấu trúc điểm · 30 + 70 (05-HD/TU)</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <ScoreBox label="Nhóm tiêu chí chung" value={fmtNum(ev.generalScore) + "/" + ev.generalMax} />
              <ScoreBox
                label="Kết quả thực hiện nhiệm vụ"
                value={fmtNum((ev.calc.arithmeticTotal ?? ev.calc.textTotal) - ev.generalScore, 1) + "/70"}
              />
              <ScoreBox
                label="Tổng điểm"
                value={ev.calc.arithmeticTotal !== null ? fmtNum(ev.calc.arithmeticTotal, 1) : fmtNum(ev.calc.textTotal, 1)}
                sub={ev.calc.arithmeticTotal !== null ? "Theo văn bản: " + fmtNum(ev.calc.textTotal, 1) : undefined}
              />
            </div>

            <div className="mt-4 rounded-card bg-fill p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[12px] font-semibold">{ev.calc.formulaText}</p>
                <Badge tone="accent">{ev.calc.ruleVersion}</Badge>
              </div>
              <div className="flex flex-col gap-2.5">
                {ev.axes.map((axis) => (
                  <div key={axis.code} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-ctl bg-accent-600 text-[11px] font-bold text-white">
                      {axis.code}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex justify-between text-[11px]">
                        <span className="truncate text-ink-2">{axis.label}</span>
                        <span className="font-semibold">{fmtNum(axis.value, 1)}%</span>
                      </div>
                      <Progress value={axis.value} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-ink-3">
                KPI theo văn bản: {ev.calc.kpiText} · Trung bình các trục: {fmtNum(ev.calc.averageAxes, 1)}%
              </p>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="mb-3 text-[14px] font-semibold">Xếp loại — điểm chỉ là một điều kiện (39-QĐ/TU)</h2>
            <div className="flex flex-col gap-2">
              {ev.conditions.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5 rounded-card bg-fill px-3 py-2">
                  <span className={"mt-0.5 h-2 w-2 shrink-0 rounded-pill " + (c.passed ? "bg-ok-600" : "bg-danger-600")} />
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium">{c.label}</p>
                    <p className="text-[11px] text-ink-3">{c.detail}</p>
                  </div>
                  <span className="ml-auto shrink-0">
                    {c.passed ? <Badge tone="ok">Đạt</Badge> : c.blocking ? <Badge tone="danger">Chặn</Badge> : <Badge tone="warn">Không đạt</Badge>}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-ink-3">
              Dải điểm cơ bản: ≥90 Xuất sắc · 70–90 Tốt · 50–70 Hoàn thành · dưới 50 hoặc trường hợp chặn → Không hoàn thành.
            </p>
          </Card>

          {isSubject && ev.status === "DRAFT" ? (
            <Card className="p-4">
              <h2 className="mb-2 text-[14px] font-semibold">Tự đánh giá, đề xuất mức xếp loại</h2>
              <Field label="Nhận xét tự đánh giá">
                <textarea
                  className="control h-20 w-full resize-none py-2"
                  value={selfComment}
                  onChange={(e) => setSelfComment(e.target.value)}
                  placeholder="Nêu kết quả nổi bật, hạn chế và nguyên nhân trong kỳ…"
                />
              </Field>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Đề xuất mức xếp loại">
                  <ClassificationSelect value={selfProposed} onChange={setSelfProposed} />
                </Field>
                <div className="flex items-end">
                  <Button variant="primary" icon={<Check size={14} weight="bold" />} onClick={() => api.selfEvaluate(ev.id, { comment: selfComment, proposed: selfProposed })}>
                    Nộp tự đánh giá
                  </Button>
                </div>
              </div>
            </Card>
          ) : null}

          {canReview ? (
            <Card className="p-4">
              <h2 className="mb-2 text-[14px] font-semibold">Thẩm định, đề xuất mức xếp loại</h2>
              <Field label="Nhận xét của người thẩm định">
                <textarea
                  className="control h-20 w-full resize-none py-2"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Nhận xét khách quan về kết quả thực hiện nhiệm vụ…"
                />
              </Field>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <div className="w-64">
                  <Field label="Đề xuất mức">
                    <ClassificationSelect value={reviewProposed} onChange={setReviewProposed} />
                  </Field>
                </div>
                <Button variant="primary" icon={<Check size={14} weight="bold" />} onClick={() => api.reviewEvaluation(ev.id, { comment: reviewComment, proposed: reviewProposed, action: "propose" })}>
                  Đề xuất
                </Button>
                <Button variant="danger" icon={<ArrowUUpLeft size={14} weight="bold" />} onClick={() => api.reviewEvaluation(ev.id, { comment: reviewComment, proposed: reviewProposed, action: "return" })}>
                  Trả lại để chỉnh sửa
                </Button>
              </div>
            </Card>
          ) : null}

          {canDecide ? (
            <Card className="p-4">
              <h2 className="mb-2 text-[14px] font-semibold">Quyết định xếp loại chất lượng</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Mức xếp loại quyết định">
                  <ClassificationSelect value={decisionCls} onChange={setDecisionCls} />
                </Field>
                <Field label="Căn cứ quyết định">
                  <input className="control w-full" value={decisionNote} onChange={(e) => setDecisionNote(e.target.value)} placeholder="Ghi căn cứ, điều kiện áp dụng" />
                </Field>
              </div>
              <div className="mt-3">
                <Button variant="primary" icon={<Gavel size={14} weight="bold" />} onClick={() => api.decideEvaluation(ev.id, { classification: decisionCls, note: decisionNote })}>
                  Quyết định xếp loại
                </Button>
              </div>
            </Card>
          ) : null}
        </div>

        <div className="flex flex-col gap-4">
          <Card className="p-4">
            <h2 className="mb-3 text-[13px] font-semibold">Các kết quả độc lập</h2>
            <div className="flex flex-col gap-2 text-[12px]">
              <ResultLine label="Tự đánh giá" value={ev.self?.proposed ?? "—"} at={ev.self?.at} />
              <ResultLine label="Thẩm định, đề xuất" value={ev.review?.proposed ?? "—"} at={ev.review?.at} />
              <ResultLine label="Quyết định cuối" value={ev.decision?.classification ?? "—"} at={ev.decision?.at} />
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-ink-3">
              Ba lớp dữ liệu được lưu riêng, không ghi đè nhau — đúng thiết kế traceability của dự án.
            </p>
          </Card>

          <Card className="p-4">
            <h2 className="mb-3 text-[13px] font-semibold">Dòng thời gian</h2>
            <div className="flex flex-col">
              {[...ev.history].reverse().map((h, i) => {
                const actor = people.find((p) => p.id === h.actorId);
                return (
                  <div key={h.id} className="flex gap-2.5">
                    <div className="flex flex-col items-center">
                      <span className={i === 0 ? "mt-0.5 h-2 w-2 rounded-pill bg-accent-600" : "mt-1 h-1.5 w-1.5 rounded-pill bg-ink-3"} />
                      {i < ev.history.length - 1 ? <span className="w-px flex-1 bg-fill-2" /> : null}
                    </div>
                    <div className="pb-4">
                      <p className="text-[12px] font-medium">{h.action}</p>
                      <p className="text-[11px] text-ink-3">{actor?.name} · {fmtDateTime(h.at)}</p>
                      {h.note ? <p className="mt-1 text-[12px] text-ink-2">{h.note}</p> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {ev.status === "LOCKED" ? (
            <Callout tone="neutral" icon={<LockSimple size={16} />} title="Kỳ đã khóa">
              Kết quả đã quyết định được giữ nguyên; chỉ mở lại qua quy trình có lý do và có thẩm quyền (TBD nội bộ).
            </Callout>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ScoreBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-card bg-fill p-3">
      <p className="text-[11px] font-medium text-ink-3">{label}</p>
      <p className="mt-1 text-[18px] font-semibold">{value}</p>
      {sub ? <p className="mt-0.5 text-[10px] text-ink-3">{sub}</p> : null}
    </div>
  );
}

function ClassificationSelect({ value, onChange }: { value: Classification; onChange: (v: Classification) => void }) {
  const options: Classification[] = ["XUAT_SAC", "TOT", "HOAN_THANH", "KHONG_HOAN_THANH"];
  return (
    <select className="control w-full" value={value} onChange={(e) => onChange(e.target.value as Classification)}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o === "XUAT_SAC" ? "Hoàn thành xuất sắc nhiệm vụ" : o === "TOT" ? "Hoàn thành tốt nhiệm vụ" : o === "HOAN_THANH" ? "Hoàn thành nhiệm vụ" : "Không hoàn thành nhiệm vụ"}
        </option>
      ))}
    </select>
  );
}

function ResultLine({ label, value, at }: { label: string; value: string; at?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-card bg-fill px-3 py-2">
      <span className="text-ink-3">{label}</span>
      <span className="text-right">
        <span className="block font-medium">{value}</span>
        {at ? <span className="block text-[10px] text-ink-3">{fmtDateTime(at)}</span> : null}
      </span>
    </div>
  );
}

