"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Paperclip, CheckCircle } from "@phosphor-icons/react";
import { useApp } from "@/lib/store";
import { canReviewTask, canViewDepartment, canViewTask } from "@/lib/policy";
import { personName } from "@/lib/shared/names";
import { RESULT_QUALITY, taskActions, taskPeriodLocked } from "@/lib/tasks";
import { useBusy } from "@/components/use-busy";
import type { Task } from "@/lib/types";
import { TASK_EDITABLE, TASK_IN_REVIEW, inGroup } from "@/lib/domain/workflow";
import { fmtDate, fmtDateTime } from "@/lib/format";
import {
  Badge,
  Button,
  Callout,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  Progress,
  SectionHeader,
  Select,
  TaskStatusBadge,
} from "@/components/ui";

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const state = useApp();
  const task = state.tasks.find((t) => t.id === id);
  if (!task || !canViewTask(state.user, task))
    return (
      <Card>
        <EmptyState
          title="Không thể mở nhiệm vụ"
          hint="Nhiệm vụ không tồn tại hoặc ngoài phạm vi truy cập."
          action={<Link href="/tasks">Về danh sách</Link>}
        />
      </Card>
    );
  return <TaskWorkspace key={task.id} task={task} />;
}
function TaskWorkspace({ task }: { task: Task }) {
  const state = useApp();
  const { user } = state;
  const locked = taskPeriodLocked(task);
  const editable =
    !locked && inGroup(TASK_EDITABLE, task.status);
  const owner = user?.id === task.assigneeId;
  const reviewer = canReviewTask(user, task.departmentId) && !owner;
  const [action, setAction] = useState<
    "return" | "accept" | "reassign" | "cancel" | null
  >(null);
  const [reason, setReason] = useState("");
  const [assignee, setAssignee] = useState("");
  const { busy, run } = useBusy();
  const [quantity, setQuantity] = useState(
    String(task.result?.quantity ?? task.plannedQuantity ?? 1),
  );
  const [product, setProduct] = useState(
    task.result?.product ?? task.catalogSnapshot?.product ?? "",
  );
  const [quality, setQuality] = useState(
    task.result?.qualityLevel ?? "Đáp ứng",
  );
  const [note, setNote] = useState(task.result?.note ?? "");
  const [date, setDate] = useState(
    (task.result?.completedAt ?? new Date().toISOString()).slice(0, 10),
  );
  const [progress, setProgress] = useState(String(task.progress));
  const [synthetic, setSynthetic] = useState(false);
  const catalog =
    task.catalogSnapshot ??
    state.catalog.find((c) => c.id === task.catalogItemId);
  async function save(submit: boolean) {
    await run(() =>
      taskActions.saveResult(
        task.id,
        {
          quantity: Number(quantity),
          product,
          qualityLevel: quality,
          note,
          completedAt: date,
        },
        submit,
        task.revision ?? 0,
      ),
    );
  }
  async function act() {
    await run(async () => {
      let ok = false;
      if (action === "return")
        ok = await taskActions.returnTask(task.id, reason);
      if (action === "accept")
        ok = await taskActions.acceptTask(task.id, reason);
      if (action === "cancel")
        ok = await taskActions.cancelTask(task.id, reason);
      if (action === "reassign")
        ok = await taskActions.reassignTask(task.id, assignee, reason);
      if (ok) {
        setAction(null);
        setReason("");
      }
    });
  }
  return (
    <div className="space-y-4">
      <Link
        href="/tasks"
        className="inline-flex items-center gap-1 text-xs text-accent-700"
      >
        <ArrowLeft size={14} />
        Danh sách nhiệm vụ
      </Link>
      <SectionHeader
        title={task.title}
        hint={`${task.id} · ${task.period}`}
        actions={<TaskStatusBadge status={task.status} />}
      />
      {locked && (
        <Callout title="Kỳ đã khóa — chỉ đọc" tone="neutral">
          Các kết quả, minh chứng và snapshot được bảo toàn. Mở lại kỳ phải có
          lý do của lãnh đạo demo.
        </Callout>
      )}
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold">Thông tin phân công</h2>
            <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-ink-2">
              {task.description || "Không có mô tả bổ sung."}
            </p>
            <dl className="mt-4 grid grid-cols-1 gap-4 text-[13px] sm:grid-cols-2">
              {[
                [
                  "Người thực hiện",
                  personName(state, task.assigneeId),
                ],
                [
                  "Vị trí lúc phân công",
                  task.assignmentSnapshot?.positionTitle ??
                    state.positions.find((p) => p.id === task.positionRefId)
                      ?.title,
                ],
                [
                  "Đơn vị",
                  task.assignmentSnapshot?.departmentName ??
                    state.departments.find((d) => d.id === task.departmentId)
                      ?.name,
                ],
                ["Hạn hoàn thành", fmtDate(task.dueAt)],
                [
                  "Danh mục",
                  `${catalog?.code ?? "—"} / ${catalog?.version ?? "—"}`,
                ],
                [
                  "Khối lượng kế hoạch",
                  `${task.plannedQuantity ?? 1} ${catalog?.unit ?? "sản phẩm"}`,
                ],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-ink-3">{label}</dt>
                  <dd className="mt-1 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-ink-3">
              Nguồn: {catalog?.sourceRef}. Danh mục operational draft; không mặc
              định là quy định pháp lý.
            </p>
            {editable && canReviewTask(user, task.departmentId) && (
              <div className="mt-4 flex gap-2">
                <Button onClick={() => setAction("reassign")}>
                  Phân công lại
                </Button>
                <Button variant="ghost" onClick={() => setAction("cancel")}>
                  Hủy nhiệm vụ
                </Button>
              </div>
            )}
          </Card>
          <Card className="p-5">
            <SectionHeader
              title="Kết quả & sản phẩm"
              hint={
                owner && editable
                  ? "Lưu nháp trước khi nộp để nghiệm thu."
                  : "Kết quả ghi nhận của người thực hiện."
              }
            />
            {owner && editable ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void save(true);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Số lượng hoàn thành">
                    <Input
                      required
                      type="number"
                      min="0.01"
                      step="0.01"
                      className="w-full"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </Field>
                  <Field label="Ngày hoàn thành">
                    <Input
                      type="date"
                      required
                      className="w-full"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </Field>
                </div>
                <Field label="Sản phẩm / kết quả">
                  <Input
                    required
                    className="w-full"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                  />
                </Field>
                <Field label="Chất lượng tự ghi nhận">
                  <Select
                    className="w-full"
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                  >
                    {RESULT_QUALITY.map((q) => (
                      <option key={q}>{q}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Diễn giải kết quả">
                  <textarea
                    className="control min-h-24 w-full py-2"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </Field>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button disabled={busy} onClick={() => void save(false)}>
                    Lưu nháp
                  </Button>
                  <Button type="submit" disabled={busy} variant="primary">
                    Nộp nghiệm thu
                  </Button>
                </div>
              </form>
            ) : task.result ? (
              <div className="space-y-2 text-[13px]">
                <p className="font-semibold">{task.result.product}</p>
                <p>
                  {task.result.quantity} {task.result.unit || catalog?.unit} ·{" "}
                  {task.result.qualityLevel}
                </p>
                <p className="whitespace-pre-wrap text-ink-2">
                  {task.result.note}
                </p>
                <p className="text-xs text-ink-3">
                  Ngày nộp:{" "}
                  {task.result.submittedAt
                    ? fmtDateTime(task.result.submittedAt)
                    : "Bản nháp"}
                </p>
              </div>
            ) : (
              <EmptyState
                title="Chưa có kết quả"
                hint="Người thực hiện sẽ nhập sản phẩm và minh chứng tại đây."
              />
            )}
            {reviewer &&
              !locked &&
              inGroup(TASK_IN_REVIEW, task.status) && (
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <Button onClick={() => setAction("return")}>
                    Yêu cầu chỉnh sửa
                  </Button>
                  <Button
                    variant="primary"
                    icon={<CheckCircle size={16} />}
                    onClick={() => setAction("accept")}
                  >
                    Nghiệm thu
                  </Button>
                </div>
              )}
          </Card>
          <Card className="p-5">
            <h2 className="mb-2 text-sm font-semibold">Minh chứng</h2>
            <p className="mb-3 text-xs leading-relaxed text-ink-3">
              Demo chỉ lưu tên và metadata, không đọc/tải nội dung tệp. Không sử
              dụng tài liệu thật hoặc dữ liệu bí mật.
            </p>
            {task.evidence.length ? (
              <ul className="space-y-2">
                {task.evidence.map((e) => (
                  <li
                    key={e.id}
                    className="flex flex-wrap items-center gap-2 rounded-ctl bg-fill p-3 text-xs"
                  >
                    <Paperclip size={17} />
                    <span className="min-w-0 flex-1 break-all">
                      {e.name}
                      <span className="mt-1 block text-ink-3">
                        {e.size} · {fmtDate(e.uploadedAt)} · chỉ metadata
                      </span>
                    </span>
                    <Badge>{e.classification}</Badge>
                    {owner && editable && (
                      <Button
                        variant="ghost"
                        onClick={() =>
                          taskActions.removeEvidence(task.id, e.id)
                        }
                      >
                        Gỡ
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-3 text-xs text-ink-3">Chưa có minh chứng.</p>
            )}
            {owner && editable && (
              <div className="mt-4 space-y-3">
                <label className="flex items-start gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={synthetic}
                    onChange={(e) => setSynthetic(e.target.checked)}
                  />
                  Tôi xác nhận tệp được chọn là dữ liệu giả lập, không chứa
                  thông tin thật.
                </label>
                <Field label="Chọn tệp mẫu (tối đa 20 MB)">
                  <input
                    type="file"
                    disabled={!synthetic}
                    className="w-full text-xs file:mr-3 file:rounded-ctl file:bg-fill-2 file:px-3 file:py-2"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file)
                        await taskActions.addEvidence(task.id, {
                          name: file.name,
                          sizeBytes: file.size,
                          kind: file.type || "FILE",
                          classification: "Nội bộ",
                          synthetic,
                        });
                      e.target.value = "";
                    }}
                  />
                </Field>
              </div>
            )}
          </Card>
        </div>
        <div className="space-y-4">
          <Card className="p-5">
            <div className="mb-3 flex justify-between text-sm">
              <h2 className="font-semibold">Tiến độ</h2>
              <span className="tabular-nums">{task.progress}%</span>
            </div>
            <Progress value={task.progress} />
            {owner && editable && (
              <div className="mt-4 space-y-2">
                <Field label="Cập nhật tiến độ (%)">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => setProgress(e.target.value)}
                    className="w-full"
                  />
                </Field>
                <Button
                  onClick={() =>
                    taskActions.updateProgress(task.id, Number(progress))
                  }
                >
                  Lưu tiến độ
                </Button>
              </div>
            )}
          </Card>
          <Card className="p-5">
            <h2 className="mb-4 text-sm font-semibold">Lịch sử nhiệm vụ</h2>
            <ol className="space-y-4">
              {task.history.toReversed().map((h) => (
                <li key={h.id} className="text-xs">
                  <p className="font-semibold">{h.action}</p>
                  <p className="mt-1 leading-relaxed text-ink-2">{h.note}</p>
                  <p className="mt-1 text-ink-3">
                    {personName(state, h.actorId) ?? h.actorId}{" "}
                    · {fmtDateTime(h.at)}
                  </p>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
      <Modal
        open={action !== null}
        title={
          action === "reassign"
            ? "Phân công lại"
            : action === "return"
              ? "Yêu cầu chỉnh sửa"
              : action === "cancel"
                ? "Hủy nhiệm vụ"
                : "Xác nhận nghiệm thu"
        }
        onClose={() => setAction(null)}
      >
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void act();
          }}
        >
          {action === "reassign" && (
            <Field label="Người thực hiện mới">
              <Select
                required
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full"
              >
                <option value="">Chọn nhân sự</option>
                {state.people
                  .filter(
                    (p) =>
                      p.id !== task.assigneeId &&
                      canViewDepartment(user, p.departmentId),
                  )
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </Select>
            </Field>
          )}
          <Field label="Nhận xét / lý do">
            <textarea
              required
              minLength={5}
              className="control min-h-24 w-full py-2"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>
          <p className="text-xs text-ink-3">
            Thao tác được ghi vào lịch sử và nhật ký kiểm toán.
          </p>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setAction(null)}>Đóng</Button>
            <Button
              type="submit"
              disabled={busy}
              variant={action === "cancel" ? "danger" : "primary"}
            >
              Xác nhận
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
