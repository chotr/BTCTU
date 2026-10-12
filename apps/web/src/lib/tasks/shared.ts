import type { Task } from "@/lib/types";
import { appendAudit, getState, pushToast, upsertTask } from "@/lib/store";
import { canViewTask } from "@/lib/policy";
import { uid, now } from "@/lib/shared/ids";
import { deny } from "@/lib/shared/feedback";
import { TASK_EDITABLE, inGroup } from "@/lib/domain/workflow";

export { TASK_EDITABLE };

export const RESULT_QUALITY = [
  "Đáp ứng tốt",
  "Đáp ứng",
  "Cần hoàn thiện",
  "Không đáp ứng",
] as const;

export const editable = (task: Task) => inGroup(TASK_EDITABLE, task.status);

/** Một nhiệm vụ thuộc một kỳ đánh giá, kể cả bản ghi cũ. */
export function taskPeriodLocked(task: Task): boolean {
  const period = getState().periods.find((p) =>
    task.periodId ? p.id === task.periodId : p.name === task.period,
  );
  return task.status === "LOCKED" || !period || period.status === "LOCKED";
}

export function findMutable(
  taskId: string,
  action: string,
  expectedRevision?: number,
): Task | null {
  const { tasks, user } = getState();
  const task = tasks.find((t) => t.id === taskId);
  if (!task || !canViewTask(user, task)) {
    deny(
      action,
      taskId,
      "Nhiệm vụ không tồn tại hoặc nằm ngoài phạm vi của bạn.",
    );
    return null;
  }
  if (taskPeriodLocked(task)) {
    deny(action, taskId, "Kỳ đã khóa hoặc không hợp lệ. Nhiệm vụ chỉ được xem.");
    return null;
  }
  if (
    expectedRevision !== undefined &&
    expectedRevision !== (task.revision ?? 0)
  ) {
    deny(
      action,
      taskId,
      "Dữ liệu đã thay đổi. Hãy tải lại trang trước khi lưu.",
    );
    return null;
  }
  return task;
}

export function update(
  task: Task,
  patch: Partial<Task>,
  action: string,
  note: string,
  message: string,
): true {
  const actorId = getState().user!.id;
  upsertTask({
    ...task,
    ...patch,
    revision: (task.revision ?? 0) + 1,
    history: [...task.history, { id: uid("TH"), at: now(), actorId, action, note }],
  });
  appendAudit({
    actorId,
    action,
    resource: task.id,
    detail: note,
    outcome: "OK",
  });
  pushToast("success", message);
  return true;
}
