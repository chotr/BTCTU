import { getState } from "@/lib/store";
import { canReviewTask, canViewDepartment } from "@/lib/policy";
import { now } from "@/lib/shared/ids";
import { deny } from "@/lib/shared/feedback";
import { personName } from "@/lib/shared/names";
import { TASK_IN_REVIEW, inGroup } from "@/lib/domain/workflow";
import { editable, findMutable, update } from "./shared";

export const reviewActions = {
  async returnTask(
    taskId: string,
    note: string,
    expectedRevision?: number,
  ): Promise<boolean> {
    const action = "Yêu cầu chỉnh sửa";
    const task = findMutable(taskId, action, expectedRevision);
    if (!task) return false;
    if (
      !canReviewTask(getState().user, task.departmentId) ||
      getState().user?.id === task.assigneeId ||
      !inGroup(TASK_IN_REVIEW, task.status)
    )
      return deny(
        action,
        taskId,
        "Chỉ người thẩm định có phạm vi phù hợp được trả lại kết quả đã nộp của người khác.",
      );
    if (note.trim().length < 5)
      return deny(action, taskId, "Nhập lý do chỉnh sửa ít nhất 5 ký tự.");
    return update(
      task,
      { status: "RETURNED" },
      action,
      note.trim(),
      "Đã trả lại nhiệm vụ, giữ nguyên kết quả để chỉnh sửa.",
    );
  },

  async acceptTask(
    taskId: string,
    note = "Kết quả đạt yêu cầu",
    expectedRevision?: number,
  ): Promise<boolean> {
    const action = "Nghiệm thu";
    const task = findMutable(taskId, action, expectedRevision);
    if (!task) return false;
    if (
      !canReviewTask(getState().user, task.departmentId) ||
      getState().user?.id === task.assigneeId ||
      !inGroup(TASK_IN_REVIEW, task.status) ||
      !task.result
    )
      return deny(
        action,
        taskId,
        "Chỉ người thẩm định được nghiệm thu kết quả đã nộp của người khác trong phạm vi phụ trách.",
      );
    return update(
      task,
      { status: "ACCEPTED", progress: 100 },
      action,
      note.trim() || "Kết quả đạt yêu cầu",
      "Đã nghiệm thu. Kết quả sẵn sàng làm đầu vào KPI.",
    );
  },

  async reassignTask(
    taskId: string,
    assigneeId: string,
    reason: string,
    expectedRevision?: number,
  ): Promise<boolean> {
    const action = "Phân công lại";
    const task = findMutable(taskId, action, expectedRevision);
    if (!task) return false;
    const s = getState();
    const person = s.people.find((p) => p.id === assigneeId);
    if (
      !canReviewTask(s.user, task.departmentId) ||
      !person ||
      !canViewDepartment(s.user, person.departmentId) ||
      !editable(task)
    )
      return deny(
        action,
        taskId,
        "Không thể phân công lại ngoài phạm vi phụ trách hoặc sau khi kết quả đã nộp.",
      );
    if (person.id === task.assigneeId || reason.trim().length < 5)
      return deny(
        action,
        taskId,
        "Chọn người thực hiện mới và nhập lý do ít nhất 5 ký tự.",
      );
    const previous = personName(s, task.assigneeId) ?? task.assigneeId;
    const department = s.departments.find((d) => d.id === person.departmentId);
    const position = s.positions.find((p) => p.id === person.positionRefId);
    return update(
      task,
      {
        assigneeId: person.id,
        assignerId: s.user!.id,
        departmentId: person.departmentId,
        positionRefId: person.positionRefId,
        assignmentSnapshot: {
          assigneeName: person.name,
          positionTitle: position?.title ?? person.title,
          departmentName: department?.name ?? person.departmentId,
          assignedAt: now(),
        },
      },
      action,
      `${previous} → ${person.name}. ${reason.trim()} (giữ lại kết quả và minh chứng nháp)`,
      "Đã phân công lại nhiệm vụ.",
    );
  },

  async cancelTask(
    taskId: string,
    reason: string,
    expectedRevision?: number,
  ): Promise<boolean> {
    const action = "Hủy nhiệm vụ";
    const task = findMutable(taskId, action, expectedRevision);
    if (!task) return false;
    if (!canReviewTask(getState().user, task.departmentId) || !editable(task))
      return deny(
        action,
        taskId,
        "Chỉ được hủy nhiệm vụ chưa nộp trong phạm vi phụ trách.",
      );
    if (reason.trim().length < 5)
      return deny(action, taskId, "Nhập lý do hủy ít nhất 5 ký tự.");
    return update(
      task,
      { status: "CANCELLED" },
      action,
      reason.trim(),
      "Đã hủy nhiệm vụ. Toàn bộ lịch sử vẫn được giữ lại.",
    );
  },
};
