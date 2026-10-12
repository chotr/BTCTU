"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "@phosphor-icons/react";
import { useApp } from "@/lib/store";
import { canReviewTask, canViewDepartment, canViewTask } from "@/lib/policy";
import { personName } from "@/lib/shared/names";
import { taskActions, taskPeriodLocked } from "@/lib/tasks";
import { useBusy } from "@/components/use-busy";
import type { Task } from "@/lib/types";
import { TASK_EDITABLE, inGroup } from "@/lib/domain/workflow";
import { fmtDate } from "@/lib/format";
import {
  Button,
  Callout,
  Card,
  EmptyState,
  Field,
  Modal,
  SectionHeader,
  Select,
  TaskStatusBadge,
} from "@/components/ui";
import {
  ResultSection,
  EvidenceSection,
  ProgressCard,
  TaskHistory,
} from "@/components/tasks";

type TaskAction = "return" | "accept" | "reassign" | "cancel";

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
  const editable = !locked && inGroup(TASK_EDITABLE, task.status);
  const owner = user?.id === task.assigneeId;
  const reviewer = canReviewTask(user, task.departmentId) && !owner;
  const [action, setAction] = useState<TaskAction | null>(null);
  const [reason, setReason] = useState("");
  const [assignee, setAssignee] = useState("");
  const { busy, run } = useBusy();
  const catalog =
    task.catalogSnapshot ??
    state.catalog.find((c) => c.id === task.catalogItemId);
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
          lý do của lãnh đạo.
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
                ["Người thực hiện", personName(state, task.assigneeId)],
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
          <ResultSection
            task={task}
            unit={catalog?.unit}
            owner={owner}
            editable={editable}
            locked={locked}
            reviewer={reviewer}
            onAction={setAction}
          />
          <EvidenceSection task={task} owner={owner} editable={editable} />
        </div>
        <div className="space-y-4">
          <ProgressCard task={task} owner={owner} editable={editable} />
          <TaskHistory task={task} state={state} />
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
