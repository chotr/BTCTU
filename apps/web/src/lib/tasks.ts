import type { Task, TaskResult } from "@/lib/types";
import {
  addTask,
  appendAudit,
  getState,
  pushToast,
  upsertTask,
} from "@/lib/store";
import {
  canAssign,
  canReviewTask,
  canSubmitResult,
  canViewDepartment,
  canViewTask,
} from "@/lib/policy";
import { uid, now } from "@/lib/shared/ids";
import { deny } from "@/lib/shared/feedback";
import { personName } from "@/lib/shared/names";
import { TASK_EDITABLE, TASK_IN_REVIEW, inGroup } from "@/lib/domain/workflow";

export const RESULT_QUALITY = [
  "Đáp ứng tốt",
  "Đáp ứng",
  "Cần hoàn thiện",
  "Không đáp ứng",
] as const;
export { TASK_EDITABLE };
const editable = (task: Task) => inGroup(TASK_EDITABLE, task.status);

/** Demo policy: a task belongs to one evaluation period, including legacy fixture names. */
export function taskPeriodLocked(task: Task): boolean {
  const period = getState().periods.find((p) =>
    task.periodId ? p.id === task.periodId : p.name === task.period,
  );
  return task.status === "LOCKED" || !period || period.status === "LOCKED";
}

function findMutable(
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
    deny(
      action,
      taskId,
      "Kỳ đã khóa hoặc không hợp lệ. Nhiệm vụ chỉ được xem.",
    );
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

function update(
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
    history: [
      ...task.history,
      { id: uid("TH"), at: now(), actorId, action, note },
    ],
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

export const taskActions = {
  async createTask(input: {
    catalogItemId: string;
    assigneeId: string;
    title: string;
    description: string;
    dueAt: string;
    periodId?: string;
    plannedQuantity?: number;
  }): Promise<boolean> {
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
    const period = input.periodId
      ? s.periods.find((p) => p.id === input.periodId)
      : s.periods.find((p) => p.status === "ACTIVE");
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
      !Number.isFinite(input.plannedQuantity ?? 1) ||
      (input.plannedQuantity ?? 1) <= 0
    )
      return deny(action, "Nhiệm vụ mới", "Số lượng kế hoạch phải lớn hơn 0.");
    const department = s.departments.find((d) => d.id === person.departmentId);
    const position = s.positions.find((p) => p.id === person.positionRefId);
    const task: Task = {
      id: uid("NV"),
      title: input.title.trim(),
      description: input.description.trim(),
      catalogItemId: cat.id,
      plannedQuantity: input.plannedQuantity ?? 1,
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
      completedAt:
        patch.completedAt ??
        task.result?.completedAt ??
        now(),
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

  async addEvidence(
    taskId: string,
    input: {
      name: string;
      sizeBytes: number;
      kind: string;
      classification: "Nội bộ";
      synthetic: boolean;
    },
    expectedRevision?: number,
  ): Promise<boolean> {
    const action = "Thêm metadata minh chứng";
    const task = findMutable(taskId, action, expectedRevision);
    if (!task) return false;
    if (!canSubmitResult(getState().user, task.assigneeId) || !editable(task))
      return deny(
        action,
        taskId,
        "Chỉ người được giao được bổ sung minh chứng trước khi nộp kết quả.",
      );
    if (!input.synthetic || input.classification !== "Nội bộ")
      return deny(
        action,
        taskId,
        "Chỉ nhận thông tin tệp giả lập Nội bộ. Không đưa tài liệu thật, Hạn chế hoặc bí mật nhà nước vào demo.",
      );
    if (
      !input.name.trim() ||
      !Number.isFinite(input.sizeBytes) ||
      input.sizeBytes <= 0 ||
      input.sizeBytes > 20 * 1024 * 1024
    )
      return deny(
        action,
        taskId,
        "Chọn tệp giả lập có dung lượng lớn hơn 0 và không quá 20 MB.",
      );
    if (
      task.evidence.some(
        (e) => e.name === input.name && e.sizeBytes === input.sizeBytes,
      )
    )
      return deny(action, taskId, "Tệp này đã có trong danh sách minh chứng.");
    const evidence = {
      id: uid("MC"),
      name: input.name.trim(),
      kind: input.kind || "FILE",
      size:
        input.sizeBytes < 1024 * 1024
          ? `${Math.ceil(input.sizeBytes / 1024)} KB`
          : `${(input.sizeBytes / 1024 / 1024).toFixed(1)} MB`,
      sizeBytes: input.sizeBytes,
      classification: "Nội bộ" as const,
      uploadedAt: now(),
      uploadedBy: getState().user!.id,
      synthetic: true,
      storageMode: "METADATA_ONLY" as const,
    };
    return update(
      task,
      { evidence: [...task.evidence, evidence] },
      action,
      `${evidence.name}; chỉ metadata, không đọc hoặc lưu nội dung tệp.`,
      "Đã lưu metadata minh chứng. Nội dung tệp không được tải lên.",
    );
  },

  async removeEvidence(
    taskId: string,
    evidenceId: string,
    expectedRevision?: number,
  ): Promise<boolean> {
    const action = "Gỡ metadata minh chứng";
    const task = findMutable(taskId, action, expectedRevision);
    if (!task) return false;
    if (!canSubmitResult(getState().user, task.assigneeId) || !editable(task))
      return deny(
        action,
        taskId,
        "Không được gỡ minh chứng sau khi kết quả đã nộp.",
      );
    const evidence = task.evidence.find((e) => e.id === evidenceId);
    if (!evidence) return deny(action, taskId, "Không tìm thấy minh chứng.");
    return update(
      task,
      { evidence: task.evidence.filter((e) => e.id !== evidenceId) },
      action,
      evidence.name,
      "Đã gỡ metadata khỏi nhiệm vụ. Lịch sử thao tác vẫn được giữ lại.",
    );
  },
};
