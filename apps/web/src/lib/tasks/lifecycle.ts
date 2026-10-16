import type { CreateTaskInput } from "@btctu/shared";
import type { Task, TaskResult } from "@/lib/types";
import { addTask, appendAudit, getState, pushToast } from "@/lib/store";
import { canAssign, canSubmitResult, canViewDepartment } from "@/lib/policy";
import { uid, now } from "@/lib/shared/ids";
import { deny } from "@/lib/shared/feedback";
import { RESULT_QUALITY, editable, findMutable, update } from "./shared";

export const lifecycleActions = {
  async createTask(input: CreateTaskInput): Promise<boolean> {
    const s = getState();
    const action = "Tạo nhiệm vụ";
    if (!s.user || !canAssign(s.user))
      return deny(
        action,
        "Nhiệm vụ mới",
        "Bạn không có quyền phân công nhiệm vụ.",
      );
    const person = s.people.find((p) => p.id === input.assigneeId);
    if (!person || !canViewDepartment(s.user, person.departmentId))
      return deny(
        action,
        "Nhiệm vụ mới",
        "Người thực hiện không thuộc phạm vi phân công.",
      );
    const cat = s.catalog.find(
      (c) => c.id === input.catalogItemId && c.status === "PUBLISHED",
    );
    if (!cat)
      return deny(
        action,
        "Nhiệm vụ mới",
        "Chỉ được phân công từ một phiên bản danh mục đã công bố.",
      );
    const period = s.periods.find((p) => p.id === input.periodId);
    if (!period || period.status !== "ACTIVE")
      return deny(
        action,
        "Nhiệm vụ mới",
        "Chọn một kỳ đang mở để giao nhiệm vụ.",
      );
    if (
      !input.title.trim() ||
      input.title.trim().length > 250 ||
      !Number.isFinite(Date.parse(input.dueAt))
    )
      return deny(
        action,
        "Nhiệm vụ mới",
        "Nhập tên nhiệm vụ (tối đa 250 ký tự) và hạn hoàn thành hợp lệ.",
      );
    if (
      !Number.isFinite(input.plannedQuantity) ||
      input.plannedQuantity <= 0
    )
      return deny(action, "Nhiệm vụ mới", "Số lượng kế hoạch phải lớn hơn 0.");
    const department = s.departments.find((d) => d.id === person.departmentId);
    const position = s.positions.find((p) => p.id === person.positionRefId);
    const task: Task = {
      id: uid("NV"),
      title: input.title.trim(),
      description: (input.description ?? "").trim(),
      catalogItemId: cat.id,
      plannedQuantity: input.plannedQuantity,
      catalogSnapshot: {
        id: cat.id,
        version: cat.version,
        code: cat.code,
        name: cat.name,
        product: cat.product,
        unit: cat.unit,
        standardScore: cat.standardScore,
        coefficient: cat.coefficient,
        durationDays: cat.durationDays,
        sourceRef: cat.sourceRef,
      },
      assignmentSnapshot: {
        assigneeName: person.name,
        positionTitle: position?.title ?? person.title,
        departmentName: department?.name ?? person.departmentId,
        assignedAt: now(),
      },
      departmentId: person.departmentId,
      assigneeId: person.id,
      assignerId: s.user.id,
      positionRefId: person.positionRefId,
      period: period.name,
      periodId: period.id,
      dueAt: input.dueAt,
      status: "ASSIGNED",
      progress: 0,
      result: null,
      evidence: [],
      revision: 1,
      history: [
        {
          id: uid("TH"),
          at: now(),
          actorId: s.user.id,
          action: "Phân công nhiệm vụ",
          note: `Giao ${person.name}; vị trí ${position?.title ?? person.title}; danh mục ${cat.code} / ${cat.version} (snapshot).`,
        },
      ],
    };
    addTask(task);
    appendAudit({
      actorId: s.user.id,
      action,
      resource: task.id,
      detail: task.history[0].note,
      outcome: "OK",
    });
    pushToast(
      "success",
      "Đã tạo nhiệm vụ và giữ bản chụp danh mục tại thời điểm phân công.",
    );
    return true;
  },

  async updateProgress(
    taskId: string,
    value: number,
    note = "",
    expectedRevision?: number,
  ): Promise<boolean> {
    const action = "Cập nhật tiến độ";
    const task = findMutable(taskId, action, expectedRevision);
    if (!task) return false;
    if (!canSubmitResult(getState().user, task.assigneeId) || !editable(task))
      return deny(
        action,
        taskId,
        "Chỉ người được giao được cập nhật nhiệm vụ đang thực hiện hoặc được trả lại.",
      );
    if (!Number.isFinite(value) || value < 0 || value > 100)
      return deny(action, taskId, "Tiến độ phải là số trong khoảng 0–100%.");
    return update(
      task,
      {
        progress: value,
        status: task.status === "ASSIGNED" ? "IN_PROGRESS" : task.status,
      },
      action,
      `${value}%${note.trim() ? ` — ${note.trim()}` : ""}`,
      "Đã cập nhật tiến độ.",
    );
  },

  async saveResult(
    taskId: string,
    patch: Pick<
      TaskResult,
      "quantity" | "product" | "qualityLevel" | "note"
    > & { completedAt?: string },
    submit: boolean,
    expectedRevision?: number,
  ): Promise<boolean> {
    const action = submit ? "Nộp kết quả" : "Lưu nháp kết quả";
    const task = findMutable(taskId, action, expectedRevision);
    if (!task) return false;
    if (!canSubmitResult(getState().user, task.assigneeId) || !editable(task))
      return deny(
        action,
        taskId,
        "Không thể chỉnh sửa kết quả ngoài nhiệm vụ được giao hoặc sau khi đã nộp.",
      );
    if (
      !Number.isFinite(patch.quantity) ||
      patch.quantity <= 0 ||
      !patch.product.trim() ||
      !RESULT_QUALITY.includes(
        patch.qualityLevel as (typeof RESULT_QUALITY)[number],
      )
    )
      return deny(
        action,
        taskId,
        "Nhập số lượng lớn hơn 0, tên sản phẩm và mức chất lượng hợp lệ.",
      );
    if (patch.completedAt && !Number.isFinite(Date.parse(patch.completedAt)))
      return deny(action, taskId, "Ngày hoàn thành không hợp lệ.");
    const catalog =
      task.catalogSnapshot ??
      getState().catalog.find((c) => c.id === task.catalogItemId);
    const result: TaskResult = {
      quantity: patch.quantity,
      product: patch.product.trim(),
      qualityLevel: patch.qualityLevel,
      note: patch.note.trim(),
      unit: catalog?.unit ?? task.result?.unit ?? "sản phẩm",
      completedAt: patch.completedAt ?? task.result?.completedAt ?? now(),
      submittedAt: submit ? now() : "",
    };
    return update(
      task,
      {
        result,
        progress: submit ? 100 : task.progress,
        status: submit
          ? "SUBMITTED"
          : task.status === "ASSIGNED"
            ? "IN_PROGRESS"
            : task.status,
      },
      action,
      `${result.quantity} ${result.unit} — ${result.product}`,
      submit ? "Đã nộp kết quả để nghiệm thu." : "Đã lưu bản nháp kết quả.",
    );
  },
};
