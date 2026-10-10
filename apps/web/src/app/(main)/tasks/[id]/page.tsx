"use client";

import { ArrowLeft, ArrowUUpLeft, Check, Paperclip, Plus } from "@phosphor-icons/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { api, perm } from "@/lib/api";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { useApp } from "@/lib/store";
import { Avatar, Badge, Button, Callout, Card, Chip, Field, Input, Progress, SectionHeader, TaskStatusBadge } from "@/components/ui";

const qualityOptions = ["Đáp ứng tốt", "Đáp ứng", "Cần hoàn thiện", "Không đáp ứng"];

export default function TaskDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? String(params.id[0]) : String(params.id);
  const { tasks, people, departments, catalog, positions, user } = useApp();
  const task = tasks.find((t) => t.id === id);

  const [quantity, setQuantity] = useState("");
  const [quality, setQuality] = useState(qualityOptions[1]);
  const [product, setProduct] = useState("");
  const [note, setNote] = useState("");
  const [returnNote, setReturnNote] = useState("");

  if (!task || !user) {
    return (
      <div>
        <SectionHeader title="Không tìm thấy nhiệm vụ" />
        <Link href="/tasks" className="text-[13px] font-medium text-accent-600 hover:underline">
          ← Quay lại danh sách công việc
        </Link>
      </div>
    );
  }

  const assignee = people.find((p) => p.id === task.assigneeId);
  const assigner = people.find((p) => p.id === task.assignerId);
  const dept = departments.find((d) => d.id === task.departmentId);
  const cat = catalog.find((c) => c.id === task.catalogItemId);
  const position = positions.find((p) => p.id === task.positionRefId);
  const editable = perm.canSubmitResult(user, task.assigneeId) && ["ASSIGNED", "IN_PROGRESS", "RETURNED"].includes(task.status);
  const canReview = perm.canReviewTask(user, task.departmentId) && task.status === "SUBMITTED";
  const locked = task.status === "LOCKED";

  async function saveResult(submit: boolean) {
    await api.saveResult(task.id, {
      quantity: Number(quantity) || 1,
      product,
      qualityLevel: quality,
      note,
    }, submit);
  }

  return (
    <div>
      <div className="mb-3">
        <Link href="/tasks" className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-3 transition-colors hover:text-accent-600">
          <ArrowLeft size={14} weight="bold" /> Công việc
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[17px] font-semibold leading-snug">{task.title}</h1>
            <TaskStatusBadge status={task.status} />
          </div>
          <p className="mt-1 text-[12px] text-ink-3">
            {task.id} · {task.period} · Hạn {fmtDate(task.dueAt)}
          </p>
        </div>
        {locked ? <Badge tone="neutral">Kỳ đã khóa — dữ liệu chỉ đọc</Badge> : null}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          <Card className="p-4">
            <h2 className="mb-2 text-[13px] font-semibold">Mô tả nhiệm vụ</h2>
            <p className="text-[13px] leading-relaxed text-ink-2">{task.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Chip className="bg-accent-50 text-accent-700">{cat?.code} · {cat?.name}</Chip>
              <Chip>Sản phẩm chuẩn: {cat?.product}</Chip>
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[13px] font-semibold">Kết quả & minh chứng</h2>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-ink-3">Tiến độ {task.progress}%</span>
                <div className="w-28">
                  <Progress value={task.progress} />
                </div>
              </div>
            </div>

            {task.result ? (
              <div className="rounded-card bg-fill p-3 text-[13px]">
                <p><span className="text-ink-3">Số lượng:</span> {task.result.quantity} {task.result.unit || "sản phẩm"}</p>
                <p><span className="text-ink-3">Sản phẩm:</span> {task.result.product || "—"}</p>
                <p><span className="text-ink-3">Chất lượng:</span> {task.result.qualityLevel}</p>
                {task.result.note ? <p className="mt-1 text-[12px] text-ink-2">{task.result.note}</p> : null}
                {task.result.submittedAt ? <p className="mt-1 text-[11px] text-ink-3">Nộp lúc {fmtDateTime(task.result.submittedAt)}</p> : null}
              </div>
            ) : (
              <p className="text-[12px] text-ink-3">Chưa có kết quả được nộp.</p>
            )}

            <div className="mt-3">
              <p className="mb-1.5 text-[12px] font-medium text-ink-2">Minh chứng ({task.evidence.length})</p>
              <div className="flex flex-col gap-1.5">
                {task.evidence.map((e) => (
                  <div key={e.id} className="flex items-center gap-2 rounded-card bg-fill px-3 py-2 text-[12px]">
                    <Paperclip size={14} className="text-ink-3" />
                    <span className="flex-1 truncate font-medium">{e.name}</span>
                    <span className="text-ink-3">{e.kind} · {e.size}</span>
                    <Badge tone={e.classification === "Hạn chế" ? "danger" : "neutral"}>{e.classification}</Badge>
                  </div>
                ))}
                {task.evidence.length === 0 ? <p className="text-[11px] text-ink-3">Chưa đính kèm minh chứng.</p> : null}
              </div>
            </div>

            {editable ? (
              <div className="mt-4 rounded-card bg-accent-50/50 p-3">
                <p className="mb-2 text-[12px] font-semibold text-accent-700">Cập nhật kết quả thực hiện</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Field label="Số lượng">
                    <Input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="1" />
                  </Field>
                  <Field label="Chất lượng sản phẩm">
                    <select className="control w-full" value={quality} onChange={(e) => setQuality(e.target.value)}>
                      {qualityOptions.map((q) => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Sản phẩm đạt được">
                    <Input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Tên sản phẩm thực tế" />
                  </Field>
                </div>
                <div className="mt-3">
                  <Field label="Ghi chú">
                    <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú kết quả (không bắt buộc)" />
                  </Field>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button variant="primary" icon={<Check size={14} weight="bold" />} onClick={() => saveResult(true)}>Nộp kết quả</Button>
                  <Button onClick={() => saveResult(false)}>Lưu nháp</Button>
                  <Button icon={<Plus size={14} />} onClick={() => api.exportReport("Đính kèm minh chứng")}>Thêm minh chứng</Button>
                </div>
              </div>
            ) : null}

            {task.status === "RETURNED" ? (
              <Callout tone="danger" title="Nhiệm vụ đang chờ chỉnh sửa" >
                Xem ý kiến của người thẩm định ở dòng thời gian bên phải, cập nhật kết quả rồi nộp lại.
              </Callout>
            ) : null}
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="p-4">
            <h2 className="mb-3 text-[13px] font-semibold">Thông tin phân công</h2>
            <div className="flex flex-col gap-2.5 text-[12px]">
              <Row label="Người thực hiện" value={assignee?.name ?? "?"} avatar />
              <Row label="Vị trí việc làm" value={position?.title ?? "—"} />
              <Row label="Người phân công" value={assigner?.name ?? "—"} />
              <Row label="Phòng" value={dept?.name ?? "—"} />
              <Row label="Hạn hoàn thành" value={fmtDate(task.dueAt)} />
            </div>
          </Card>

          {canReview ? (
            <Card className="p-4">
              <h2 className="mb-2 text-[13px] font-semibold">Thẩm định kết quả</h2>
              <p className="mb-2 text-[12px] leading-relaxed text-ink-2">Kết quả đang chờ nghiệm thu trong phạm vi quyền của bạn.</p>
              <Field label="Nhận xét khi trả lại (nếu cần)">
                <Input value={returnNote} onChange={(e) => setReturnNote(e.target.value)} placeholder="Nhập lý do yêu cầu chỉnh sửa" />
              </Field>
              <div className="mt-3 flex gap-2">
                <Button variant="primary" icon={<Check size={14} weight="bold" />} onClick={() => api.acceptTask(task.id)}>Nghiệm thu đạt</Button>
                <Button variant="danger" icon={<ArrowUUpLeft size={14} weight="bold" />} onClick={() => api.returnTask(task.id, returnNote)}>Trả lại</Button>
              </div>
            </Card>
          ) : null}

          <Card className="p-4">
            <h2 className="mb-3 text-[13px] font-semibold">Dòng thời gian</h2>
            <div className="flex flex-col">
              {[...task.history].reverse().map((h, i) => {
                const actor = people.find((p) => p.id === h.actorId);
                return (
                  <div key={h.id} className="flex gap-2.5">
                    <div className="flex flex-col items-center">
                      <span className={i === 0 ? "mt-0.5 h-2 w-2 rounded-pill bg-accent-600" : "mt-1 h-1.5 w-1.5 rounded-pill bg-ink-3"} />
                      <span className={i === task.history.length - 1 ? "hidden" : "w-px flex-1 bg-fill-2"} />
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
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, avatar }: { label: string; value: string; avatar?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-ink-3">{label}</span>
      <span className="flex items-center gap-1.5 text-right font-medium">
        {avatar ? <Avatar name={value} size="sm" /> : null}
        {value}
      </span>
    </div>
  );
}

