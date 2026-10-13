"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Calculator, CheckCircle } from "@phosphor-icons/react";
import { useApp } from "@/lib/store";
import {
  canDecide,
  canReviewEvaluation,
  canViewEvaluation,
} from "@/lib/policy";
import { personName } from "@/lib/shared/names";
import { useBusy } from "@/components/use-busy";
import {
  EVAL_EDITABLE,
  EVAL_FINAL,
  EVAL_IN_REVIEW,
  inGroup,
} from "@/lib/domain/workflow";
import {
  api,
  canCalculateEvaluation,
  canSelfEvaluate,
  evaluationLabel,
  evaluationTotal,
} from "@/lib/api";
import {
  classificationEligibility,
  evaluationTasks,
} from "@/lib/evaluation-engine";
import {
  CLASS_LABELS,
  EVAL_STATUS_LABELS,
  type Classification,
  type Evaluation,
} from "@/lib/types";
import { fmtDateTime } from "@/lib/format";
import {
  Badge,
  Button,
  Callout,
  Card,
  ClassificationBadge,
  EmptyState,
  EvalStatusBadge,
  Field,
  Input,
  Progress,
  SectionHeader,
  Select,
  TaskStatusBadge,
} from "@/components/ui";
export default function EvaluationDetail() {
  const { id } = useParams<{ id: string }>();
  const state = useApp();
  const ev = state.evaluations.find((e) => e.id === id);
  if (!ev || !canViewEvaluation(state.user, ev))
    return (
      <Card>
        <EmptyState
          title="Không thể mở hồ sơ"
          hint="Hồ sơ không tồn tại hoặc ngoài phạm vi của bạn."
          action={<Link href="/evaluation">Về danh sách</Link>}
        />
      </Card>
    );
  return <Workspace key={ev.id} ev={ev} />;
}
function Workspace({ ev }: { ev: Evaluation }) {
  const state = useApp();
  const { user } = state;
  const period = state.periods.find((p) => p.id === ev.periodId);
  const locked =
    period?.status !== "ACTIVE" || inGroup(EVAL_FINAL, ev.status);
  const self = canSelfEvaluate(user, ev);
  const canCalc =
    !locked &&
    inGroup(EVAL_EDITABLE, ev.status) &&
    canCalculateEvaluation(user, ev) &&
    (ev.status === "DRAFT" ||
      (!self && canReviewEvaluation(user, ev.departmentId)));
  const reviewer = canReviewEvaluation(user, ev.departmentId) && !self;
  const [general, setGeneral] = useState(String(ev.generalScore));
  const [leadership, setLeadership] = useState(
    String(ev.axes.find((a) => a.code === "D")?.value ?? ""),
  );
  const [override, setOverride] = useState("");
  const [calcReason, setCalcReason] = useState("");
  const [checks, setChecks] = useState(ev.conditions);
  const [conditionReason, setConditionReason] = useState(
    ev.conditionReason ?? "",
  );
  const [quota, setQuota] = useState<
    NonNullable<Evaluation["quotaApplicability"]>
  >(ev.quotaApplicability ?? "UNKNOWN");
  const [quotaConfirmed, setQuotaConfirmed] = useState(
    ev.quotaConfirmed ?? false,
  );
  const [comment, setComment] = useState("");
  const [proposed, setProposed] = useState<Classification>(
    ev.review?.proposed ?? ev.self?.proposed ?? "TOT",
  );
  const { busy, run: execute } = useBusy();
  const [tab, setTab] = useState("overview");
  const run = ev.calculationRuns?.at(-1);
  const tasks = period ? evaluationTasks(state.tasks, ev, period) : [];
  const eligibility = classificationEligibility(
    evaluationTotal(ev),
    ev.conditions,
    proposed,
    ev.quotaApplicability,
    ev.quotaConfirmed,
  );
  const tabs = [
    ["overview", "Tính điểm & điều kiện"],
    ["workflow", "Tự đánh giá / xử lý"],
    ["snapshots", "Lần tính & lịch sử"],
  ];
  return (
    <div className="space-y-4">
      <Link
        href="/evaluation"
        className="inline-flex items-center gap-1 text-xs text-accent-700"
      >
        <ArrowLeft size={14} />
        Hồ sơ đánh giá
      </Link>
      <SectionHeader
        title={evaluationLabel(ev, state)}
        hint={`${ev.subjectType === "DEPARTMENT" ? "Tập thể phòng" : "Cá nhân"} · ${period?.name} · ${ev.id}`}
        actions={
          <>
            <Badge tone="warn">CANDIDATE</Badge>
            <EvalStatusBadge status={ev.status} />
          </>
        }
      />
      <Card className="p-4">
        <ol className="flex flex-wrap gap-x-5 gap-y-3 text-xs">
          {Object.entries(EVAL_STATUS_LABELS).map(([status, label], index) => (
            <li
              key={status}
              className={`flex items-center gap-2 ${status === ev.status ? "font-semibold text-accent-700" : "text-ink-3"}`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-ctl ${status === ev.status ? "bg-accent-100" : "bg-fill-2"}`}
              >
                {index + 1}
              </span>
              {label}
            </li>
          ))}
        </ol>
      </Card>
      <Callout
        title={
          locked
            ? "Hồ sơ chỉ đọc — bảo toàn kết quả"
            : "Công thức demo có giải thích nguồn"
        }
        tone={locked ? "neutral" : "accent"}
      >
        05-HD/TU là nguồn khung 30+70 và ABCD lãnh đạo; cách tính các trục từ
        nhiệm vụ là thiết kế ứng viên. INC-01: ví dụ nguồn ghi 80,3 nhưng phép
        tính 30 + 82,3% × 70 = 87,61. Không tự sửa nguồn hoặc kích hoạt quy tắc
        chính thức.{" "}
        {period?.kind === "MONTH" || period?.kind === "YEAR"
          ? "Không tự cộng/trung bình tháng, quý thành xếp loại năm khi chưa có quy tắc xác nhận."
          : ""}
      </Callout>
      <div
        role="tablist"
        aria-label="Nội dung hồ sơ"
        className="flex flex-wrap gap-1"
      >
        {tabs.map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`rounded-ctl px-4 py-2 text-[13px] font-medium ${tab === id ? "bg-surface text-accent-700 shadow-card" : "text-ink-2 hover:bg-fill"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "overview" && (
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(300px,2fr)]">
          <div className="space-y-4">
            <Card className="p-5">
              <SectionHeader
                title="Đầu vào KPI"
                hint={`${tasks.length} nhiệm vụ trong phạm vi và kỳ đánh giá; nhiệm vụ hủy được loại trừ.`}
              />
              {tasks.length ? (
                <ul className="space-y-2">
                  {tasks.map((t) => (
                    <li
                      key={t.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-ctl bg-fill p-3 text-xs"
                    >
                      <div>
                        <Link
                          href={`/tasks/${t.id}`}
                          className="font-medium text-accent-700 hover:underline"
                        >
                          {t.title}
                        </Link>
                        <p className="mt-1 text-ink-3">
                          {t.result?.quantity ?? 0}/{t.plannedQuantity ?? 1} sản
                          phẩm · {t.result?.qualityLevel ?? "Chưa có kết quả"}
                        </p>
                      </div>
                      <TaskStatusBadge status={t.status} />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title="Chưa có nhiệm vụ trong kỳ"
                  hint="Cần nhiệm vụ đã nghiệm thu để có dữ liệu tính điểm."
                />
              )}
            </Card>
            <Card className="p-5">
              <h2 className="mb-4 text-sm font-semibold">Tính điểm ứng viên</h2>
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-ctl bg-accent-50 p-4">
                  <p className="text-xs text-ink-2">Tổng điểm / 100</p>
                  <p className="mt-2 text-3xl font-semibold tabular-nums text-accent-700">
                    {run ? evaluationTotal(ev).toFixed(2) : "—"}
                  </p>
                </div>
                <div className="rounded-ctl bg-fill p-4">
                  <p className="text-xs text-ink-2">Phiên bản tính</p>
                  <p className="mt-2 break-words text-xs font-semibold">
                    {run?.ruleVersion ?? "Chưa có lần tính mới"}
                  </p>
                </div>
              </div>
              {ev.axes.map((a) => (
                <div key={a.code} className="mb-3">
                  <div className="mb-1 flex justify-between gap-3 text-xs">
                    <span>
                      {a.code} · {a.label}
                    </span>
                    <span className="font-semibold tabular-nums">
                      {a.value.toFixed(2)}%
                    </span>
                  </div>
                  <Progress value={a.value} />
                  <p className="mt-1 text-[11px] leading-relaxed text-ink-3">
                    {a.detail}
                  </p>
                </div>
              ))}
              {run?.missingInputs.length ? (
                <Callout tone="warn" title="Chưa đủ đầu vào">
                  <ul className="list-inside list-disc">
                    {run.missingInputs.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </Callout>
              ) : null}
              {canCalc && (
                <form
                  className="mt-5 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void execute(() =>
                      api.calculateEvaluation(ev.id, {
                        generalScore: Number(general),
                        leadershipScore: ev.isLeader
                          ? Number(leadership)
                          : undefined,
                        reason: calcReason,
                        overrideTotal:
                          override !== "" ? Number(override) : undefined,
                      }),
                    );
                  }}
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Điểm chung (0–30)">
                      <Input
                        required
                        type="number"
                        min="0"
                        max="30"
                        step="0.01"
                        className="w-full"
                        value={general}
                        onChange={(e) => setGeneral(e.target.value)}
                      />
                    </Field>
                    {ev.isLeader && (
                      <Field label="D · Điều hành (0–100)">
                        <Input
                          required
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          className="w-full"
                          value={leadership}
                          onChange={(e) => setLeadership(e.target.value)}
                        />
                      </Field>
                    )}
                  </div>
                  {canDecide(user) && (
                    <Field
                      label="Điều chỉnh tổng điểm (tùy chọn)"
                      hint="Quyền lãnh đạo demo; phải có lý do. Giữ nguyên cả điểm tính gốc và điểm điều chỉnh."
                    >
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        className="w-full"
                        value={override}
                        onChange={(e) => setOverride(e.target.value)}
                        placeholder="Để trống để dùng điểm tính"
                      />
                    </Field>
                  )}
                  <Field label="Giải trình / lý do">
                    <Input
                      required={override !== ""}
                      className="w-full"
                      value={calcReason}
                      onChange={(e) => setCalcReason(e.target.value)}
                    />
                  </Field>
                  <Button
                    disabled={busy}
                    variant="primary"
                    type="submit"
                    icon={<Calculator size={16} />}
                  >
                    Tính và lưu snapshot
                  </Button>
                </form>
              )}
            </Card>
          </div>
          <Card className="p-5">
            <h2 className="text-sm font-semibold">Điều kiện xếp loại</h2>
            <p className="mt-2 text-xs leading-relaxed text-ink-3">
              QĐ39 Điều 11: dải 90 / 70 / 50 không đủ để tự xếp loại. Checklist
              bên dưới là cấu hình demo, cần xác nhận nghiệp vụ cho từng nhóm
              đối tượng.
            </p>
            <div className="mt-4 space-y-4">
              {checks.map((c) => (
                <label
                  key={c.id}
                  className="flex items-start gap-3 text-[13px]"
                >
                  <input
                    className="mt-1"
                    type="checkbox"
                    disabled={!canCalc}
                    checked={c.passed}
                    onChange={(e) =>
                      setChecks((rows) =>
                        rows.map((r) =>
                          r.id === c.id
                            ? { ...r, passed: e.target.checked }
                            : r,
                        ),
                      )
                    }
                  />
                  <span>
                    <span className="font-medium">{c.label}</span>
                    {c.blocking && (
                      <span className="ml-1 text-danger-600">*</span>
                    )}
                    <span className="mt-1 block text-xs leading-relaxed text-ink-3">
                      {c.detail}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-5 space-y-3">
              <Field label="Hạn mức / nhóm so sánh">
                <Select
                  disabled={!canCalc}
                  className="w-full"
                  value={quota}
                  onChange={(e) => setQuota(e.target.value as typeof quota)}
                >
                  <option value="UNKNOWN">TBD — chưa xác định</option>
                  <option value="NOT_APPLICABLE">
                    Không áp dụng (giả lập đã xác nhận)
                  </option>
                  <option value="APPLIES">Có áp dụng (cấu hình giả lập)</option>
                </Select>
              </Field>
              {quota === "APPLIES" && (
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    disabled={!canCalc}
                    checked={quotaConfirmed}
                    onChange={(e) => setQuotaConfirmed(e.target.checked)}
                  />
                  Đã đối chiếu hạn mức nhóm (minh họa)
                </label>
              )}
              <Field label="Căn cứ xác nhận điều kiện">
                <textarea
                  disabled={!canCalc}
                  className="control min-h-24 w-full py-2"
                  value={conditionReason}
                  onChange={(e) => setConditionReason(e.target.value)}
                />
              </Field>
              {canCalc && (
                <Button
                  disabled={busy || !conditionReason.trim()}
                  onClick={() =>
                    execute(() =>
                      api.updateConditions(
                        ev.id,
                        checks,
                        conditionReason,
                        quota,
                        quotaConfirmed,
                      ),
                    )
                  }
                >
                  Lưu xác nhận
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}
      {tab === "workflow" && (
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
          <Card className="p-5">
            <h2 className="mb-4 text-sm font-semibold">
              Ý kiến theo từng bước
            </h2>
            {[
              ["Tự đánh giá", ev.self?.comment, ev.self?.proposed],
              ["Thẩm định / đề xuất", ev.review?.comment, ev.review?.proposed],
              ["Quyết định", ev.decision?.note, ev.decision?.classification],
            ].map(([label, note, cls]) => (
              <div key={label} className="mb-4 rounded-ctl bg-fill p-4">
                <p className="text-xs font-semibold">{label}</p>
                <p className="my-2 whitespace-pre-wrap text-[13px] text-ink-2">
                  {note || "Chưa có ý kiến"}
                </p>
                {cls && <ClassificationBadge value={cls as Classification} />}
              </div>
            ))}
          </Card>
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold">Thao tác hồ sơ</h2>
            {locked ? (
              <EmptyState
                title="Đã hoàn tất / khóa"
                hint="Mở lại kỳ trong Quản lý kỳ nếu cần điều chỉnh có kiểm soát."
              />
            ) : (self && ev.status === "DRAFT") ||
              (reviewer && inGroup(EVAL_IN_REVIEW, ev.status)) ? (
              <div className="space-y-4">
                <Field label="Mức đề xuất / quyết định">
                  <Select
                    className="w-full"
                    value={proposed}
                    onChange={(e) =>
                      setProposed(e.target.value as Classification)
                    }
                  >
                    {Object.entries(CLASS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Nhận xét / căn cứ / lý do trả lại">
                  <textarea
                    className="control min-h-32 w-full py-2"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </Field>
                {eligibility.length > 0 && (
                  <Callout title="Cảnh báo trước khi quyết định" tone="warn">
                    {eligibility.join(" ")}
                  </Callout>
                )}
                <div className="flex flex-wrap gap-2">
                  {self && ev.status === "DRAFT" && (
                    <Button
                      disabled={busy || !comment.trim()}
                      variant="primary"
                      onClick={() =>
                        execute(() =>
                          api.selfEvaluate(ev.id, {
                            comment,
                            proposed,
                          }),
                        )
                      }
                    >
                      Nộp tự đánh giá
                    </Button>
                  )}
                  {reviewer && ev.status === "SUBMITTED" && (
                    <Button
                      disabled={busy || !comment.trim()}
                      variant="primary"
                      onClick={() =>
                        execute(() =>
                          api.reviewEvaluation(ev.id, {
                            comment,
                            proposed,
                            action: "propose",
                          }),
                        )
                      }
                    >
                      Thẩm định và trình
                    </Button>
                  )}
                  {reviewer &&
                    (ev.status === "SUBMITTED" ||
                      (ev.status === "REVIEWED" && canDecide(user))) && (
                      <Button
                        disabled={busy || !comment.trim()}
                        onClick={() =>
                          execute(() =>
                            api.reviewEvaluation(ev.id, {
                              comment,
                              proposed,
                              action: "return",
                            }),
                          )
                        }
                      >
                        Trả lại hồ sơ
                      </Button>
                    )}
                  {canDecide(user) && ev.status === "REVIEWED" && (
                    <Button
                      variant="primary"
                      icon={<CheckCircle size={16} />}
                      disabled={
                        busy || !comment.trim() || eligibility.length > 0
                      }
                      onClick={() =>
                        execute(() =>
                          api.decideEvaluation(ev.id, {
                            classification: proposed,
                            note: comment,
                          }),
                        )
                      }
                    >
                      Quyết định xếp loại
                    </Button>
                  )}
                </div>
                <p className="text-xs text-ink-3">
                  Quyền ở đây là ma trận mô phỏng. Lãnh đạo demo không đại diện
                  thẩm quyền chính thức theo từng nhóm QĐ39.
                </p>
              </div>
            ) : (
              <EmptyState
                title="Đang chờ bước tiếp theo"
                hint="Đổi sang đúng tài khoản demo để tự đánh giá, thẩm định hoặc quyết định. Không tự thẩm định hồ sơ của mình."
              />
            )}
          </Card>
        </div>
      )}
      {tab === "snapshots" && (
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold">
              Các lần tính bất biến
            </h2>
            {ev.calculationRuns?.length ? (
              ev.calculationRuns.toReversed().map((r) => (
                <details key={r.id} className="mb-3 rounded-ctl bg-fill p-4">
                  <summary className="cursor-pointer text-[13px] font-semibold">
                    {fmtDateTime(r.at)} · {r.finalTotal.toFixed(2)} điểm ·{" "}
                    {r.ruleVersion}
                  </summary>
                  <div className="mt-3 space-y-2 text-xs text-ink-2">
                    <p>
                      {r.id} · {r.reason}
                    </p>
                    <p>
                      Điểm gốc: {r.calculatedTotal}; điểm sau điều chỉnh:{" "}
                      {r.finalTotal}
                      {r.override ? ` · Lý do: ${r.override.reason}` : ""}
                    </p>
                    <p>
                      Trục:{" "}
                      {r.axes.map((a) => `${a.code}=${a.value}`).join("; ")}
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[560px] text-left">
                        <thead>
                          <tr>
                            <th className="py-2">Nhiệm vụ</th>
                            <th>Khối lượng</th>
                            <th>Chất lượng</th>
                            <th>Danh mục</th>
                          </tr>
                        </thead>
                        <tbody>
                          {r.taskSnapshots.map((t) => (
                            <tr key={t.id}>
                              <td className="py-2">
                                {t.id} · {t.status}
                              </td>
                              <td>
                                {t.quantity}/{t.plannedQuantity}
                              </td>
                              <td>{t.quality || "—"}</td>
                              <td>{t.catalogVersion}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {r.missingInputs.map((m) => (
                      <p key={m} className="text-warn-600">
                        {m}
                      </p>
                    ))}
                  </div>
                </details>
              ))
            ) : (
              <p className="text-xs text-ink-3">
                Chưa có lần tính mới; các điểm trong dữ liệu mẫu không được coi
                là snapshot đã xác minh.
              </p>
            )}
          </Card>
          {!!ev.decisionHistory?.length && (
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-semibold">
                Quyết định trước khi mở lại
              </h2>
              {ev.decisionHistory.map((d, i) => (
                <div className="mb-3 text-xs" key={i}>
                  <ClassificationBadge value={d.classification} />
                  <p className="mt-2">
                    {fmtDateTime(d.at)} · {d.note ?? "Quyết định mẫu"}
                  </p>
                </div>
              ))}
            </Card>
          )}
          <Card className="p-5">
            <h2 className="mb-4 text-sm font-semibold">Nhật ký hồ sơ</h2>
            <ol className="space-y-4">
              {ev.history.toReversed().map((h) => (
                <li key={h.id} className="text-xs">
                  <p className="font-semibold">{h.action}</p>
                  <p className="mt-1 text-ink-2">{h.note}</p>
                  <p className="mt-1 text-ink-3">
                    {fmtDateTime(h.at)} ·{" "}
                    {personName(state, h.actorId) ?? h.actorId}
                  </p>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      )}
    </div>
  );
}
