import type { Classification, DemoUser, Task, TaskResult } from "@/lib/types";
import {
  addTask,
  appendAudit,
  getState,
  pushToast,
  setPeriodLocked,
  setUser,
  upsertEvaluation,
  upsertTask,
} from "@/lib/store";
import { USERS } from "@/lib/mock/data";

const wait = (ms = 180): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

function personName(id: string): string {
  const s = getState();
  return s.people.find((p) => p.id === id)?.name ?? id;
}

function randTaskId(): string {
  return "NV-" + Math.random().toString(36).slice(2, 6).toUpperCase();
}

/* Quyền demo — mô phỏng ma trận quyền, không phải quy định chính thức. */
export const perm = {
  canAssign(user: DemoUser | null): boolean {
    return user !== null && (user.role === "lanh_dao" || user.role === "truong_phong");
  },
  canSubmitResult(user: DemoUser | null, assigneeId: string): boolean {
    return user !== null && user.id === assigneeId;
  },
  canReviewTask(user: DemoUser | null, taskDeptId: string): boolean {
    if (!user) return false;
    if (user.role === "lanh_dao") return true;
    return user.role === "truong_phong" && user.departmentId === taskDeptId;
  },
  canReviewEvaluation(user: DemoUser | null, evalDeptId: string): boolean {
    if (!user) return false;
    if (user.role === "lanh_dao") return true;
    return user.role === "truong_phong" && user.departmentId === evalDeptId;
  },
  canDecide(user: DemoUser | null): boolean {
    return user !== null && user.role === "lanh_dao";
  },
  canLock(user: DemoUser | null): boolean {
    return user !== null && user.role === "lanh_dao";
  },
  canViewAudit(user: DemoUser | null): boolean {
    return user !== null && user.role !== "cong_chuc";
  },
};

export const api = {
  async login(userId: string): Promise<void> {
    await wait(120);
    const user = USERS.find((u) => u.id === userId);
    if (!user) return;
    setUser(user);
    appendAudit({
      actorId: user.id,
      action: "Đăng nhập",
      resource: "Phiên làm việc",
      detail: "Đăng nhập tài khoản demo " + user.name,
      outcome: "OK",
    });
  },

  async logout(): Promise<void> {
    const user = getState().user;
    setUser(null);
    if (user) {
      appendAudit({
        actorId: user.id,
        action: "Đăng xuất",
        resource: "Phiên làm việc",
        detail: "",
        outcome: "OK",
      });
    }
  },

  async createTask(input: {
    catalogItemId: string;
    assigneeId: string;
    title: string;
    description: string;
    dueAt: string;
  }): Promise<boolean> {
    await wait();
    const s = getState();
    if (!perm.canAssign(s.user)) {
      appendAudit({
        actorId: s.user?.id ?? "?",
        action: "Tạo nhiệm vụ",
        resource: input.title,
        detail: "Không đủ quyền phân công",
        outcome: "DENIED",
      });
      pushToast("error", "Bạn không có quyền tạo nhiệm vụ");
      return false;
    }
    const assignee = s.people.find((p) => p.id === input.assigneeId);
    if (!assignee) return false;
    const task = {
      id: randTaskId(),
      title: input.title,
      description: input.description,
      catalogItemId: input.catalogItemId,
      departmentId: assignee.departmentId,
      assigneeId: input.assigneeId,
      assignerId: s.user!.id,
      positionRefId: assignee.positionRefId,
      period: "Quý III/2026",
      dueAt: input.dueAt,
      status: "ASSIGNED" as const,
      progress: 0,
      result: null,
      evidence: [],
      history: [
        {
          id: "h" + Date.now(),
          at: new Date().toISOString(),
          actorId: s.user!.id,
          action: "Phân công nhiệm vụ",
          note: "Gắn vị trí việc làm: " + assignee.title,
        },
      ],
    };
    addTask(task);
    appendAudit({
      actorId: s.user!.id,
      action: "Tạo nhiệm vụ",
      resource: task.id,
      detail: "Phân công cho " + assignee.name,
      outcome: "OK",
    });
    pushToast("success", "Đã tạo và phân công nhiệm vụ");
    return true;
  },

  async saveResult(
    taskId: string,
    patch: Pick<TaskResult, "quantity" | "product" | "qualityLevel" | "note">,
    submit: boolean,
  ): Promise<boolean> {
    await wait();
    const s = getState();
    const task = s.tasks.find((t) => t.id === taskId);
    if (!task || !s.user || !perm.canSubmitResult(s.user, task.assigneeId)) {
      pushToast("error", "Bạn không có quyền cập nhật kết quả nhiệm vụ này");
      return false;
    }
    const result: TaskResult = {
      ...patch,
      unit: "",
      submittedAt: submit ? new Date().toISOString() : "",
    };
    const updated = {
      ...task,
      progress: submit ? 100 : task.progress,
      status: (submit ? "SUBMITTED" : task.status === "ASSIGNED" ? "IN_PROGRESS" : task.status) as Task["status"],
      result,
      history: [
        ...task.history,
        {
          id: "h" + Date.now(),
          at: new Date().toISOString(),
          actorId: s.user.id,
          action: submit ? "Nộp kết quả" : "Lưu nháp kết quả",
          note: submit ? "Chờ nghiệm thu" : "",
        },
      ],
    };
    upsertTask(updated);
    appendAudit({
      actorId: s.user.id,
      action: submit ? "Nộp kết quả" : "Cập nhật kết quả",
      resource: task.id,
      detail: "",
      outcome: "OK",
    });
    pushToast("success", submit ? "Đã nộp kết quả, chờ nghiệm thu" : "Đã lưu nháp kết quả");
    return true;
  },

  async returnTask(taskId: string, note: string): Promise<boolean> {
    await wait();
    const s = getState();
    const task = s.tasks.find((t) => t.id === taskId);
    if (!task || !s.user || !perm.canReviewTask(s.user, task.departmentId)) return false;
    upsertTask({
      ...task,
      status: "RETURNED",
      history: [
        ...task.history,
        {
          id: "h" + Date.now(),
          at: new Date().toISOString(),
          actorId: s.user.id,
          action: "Yêu cầu chỉnh sửa",
          note,
        },
      ],
    });
    appendAudit({
      actorId: s.user.id,
      action: "Yêu cầu chỉnh sửa",
      resource: task.id,
      detail: note,
      outcome: "OK",
    });
    pushToast("success", "Đã yêu cầu chỉnh sửa");
    return true;
  },

  async acceptTask(taskId: string): Promise<boolean> {
    await wait();
    const s = getState();
    const task = s.tasks.find((t) => t.id === taskId);
    if (!task || !s.user || !perm.canReviewTask(s.user, task.departmentId)) return false;
    upsertTask({
      ...task,
      status: "ACCEPTED",
      history: [
        ...task.history,
        {
          id: "h" + Date.now(),
          at: new Date().toISOString(),
          actorId: s.user.id,
          action: "Nghiệm thu",
          note: "Kết quả đạt yêu cầu",
        },
      ],
    });
    appendAudit({
      actorId: s.user.id,
      action: "Nghiệm thu",
      resource: task.id,
      detail: "",
      outcome: "OK",
    });
    pushToast("success", "Đã nghiệm thu kết quả");
    return true;
  },

  async selfEvaluate(
    evaluationId: string,
    input: { comment: string; proposed: Classification },
  ): Promise<boolean> {
    await wait();
    const s = getState();
    const ev = s.evaluations.find((e) => e.id === evaluationId);
    if (!ev || !s.user || ev.subjectId !== s.user.id) return false;
    upsertEvaluation({
      ...ev,
      status: "SUBMITTED",
      self: { ...input, at: new Date().toISOString() },
      history: [
        ...ev.history,
        {
          id: "h" + Date.now(),
          at: new Date().toISOString(),
          actorId: s.user.id,
          action: "Nộp tự đánh giá",
          note: "Đề xuất xếp loại: " + input.proposed,
        },
      ],
    });
    appendAudit({
      actorId: s.user.id,
      action: "Nộp tự đánh giá",
      resource: evaluationId,
      detail: "",
      outcome: "OK",
    });
    pushToast("success", "Đã nộp tự đánh giá");
    return true;
  },

  async reviewEvaluation(
    evaluationId: string,
    input: { comment: string; proposed: Classification; action: "propose" | "return" },
  ): Promise<boolean> {
    await wait();
    const s = getState();
    const ev = s.evaluations.find((e) => e.id === evaluationId);
    if (!ev || !s.user || !perm.canReviewEvaluation(s.user, ev.departmentId)) {
      pushToast("error", "Bạn không có quyền thẩm định bản đánh giá này");
      return false;
    }
    const nextStatus = input.action === "propose" ? "REVIEWED" : "DRAFT";
    upsertEvaluation({
      ...ev,
      status: nextStatus,
      review: input.action === "propose" ? { ...input, reviewerId: s.user.id, at: new Date().toISOString() } : ev.review,
      history: [
        ...ev.history,
        {
          id: "h" + Date.now(),
          at: new Date().toISOString(),
          actorId: s.user.id,
          action: input.action === "propose" ? "Thẩm định, đề xuất" : "Trả lại để chỉnh sửa",
          note: input.comment,
        },
      ],
    });
    appendAudit({
      actorId: s.user.id,
      action: input.action === "propose" ? "Thẩm định, đề xuất" : "Trả lại tự đánh giá",
      resource: evaluationId,
      detail: input.comment,
      outcome: "OK",
    });
    pushToast("success", input.action === "propose" ? "Đã thẩm định và đề xuất" : "Đã trả lại để chỉnh sửa");
    return true;
  },

  async decideEvaluation(
    evaluationId: string,
    input: { classification: Classification; note: string },
  ): Promise<boolean> {
    await wait();
    const s = getState();
    const ev = s.evaluations.find((e) => e.id === evaluationId);
    if (!ev || !s.user || !perm.canDecide(s.user)) {
      pushToast("error", "Chỉ cấp có thẩm quyền được quyết định xếp loại");
      return false;
    }
    upsertEvaluation({
      ...ev,
      status: "APPROVED",
      decision: { classification: input.classification, decidedById: s.user.id, at: new Date().toISOString() },
      history: [
        ...ev.history,
        {
          id: "h" + Date.now(),
          at: new Date().toISOString(),
          actorId: s.user.id,
          action: "Quyết định xếp loại",
          note: input.note,
        },
      ],
    });
    appendAudit({
      actorId: s.user.id,
      action: "Quyết định xếp loại",
      resource: evaluationId,
      detail: input.classification,
      outcome: "OK",
    });
    pushToast("success", "Đã quyết định xếp loại");
    return true;
  },

  async lockPeriod(periodId: string): Promise<boolean> {
    await wait();
    const s = getState();
    if (!s.user || !perm.canLock(s.user)) return false;
    const now = new Date().toISOString();
    setPeriodLocked(periodId, now);
    setUser(s.user);
    for (const ev of s.evaluations.filter((e) => e.periodId === periodId && e.status === "APPROVED")) {
      upsertEvaluation({
        ...ev,
        status: "LOCKED",
        history: [
          ...ev.history,
          { id: "h" + Date.now(), at: now, actorId: s.user.id, action: "Khóa kỳ", note: "Kỳ đánh giá đã khóa" },
        ],
      });
    }
    appendAudit({
      actorId: s.user.id,
      action: "Khóa kỳ đánh giá",
      resource: periodId,
      detail: "",
      outcome: "OK",
    });
    pushToast("success", "Đã khóa kỳ đánh giá");
    return true;
  },

  async exportReport(label: string): Promise<void> {
    await wait();
    const user = getState().user;
    appendAudit({
      actorId: user?.id ?? "?",
      action: "Xuất báo cáo",
      resource: label,
      detail: "Báo cáo demo — chức năng xuất sẽ nối API sau",
      outcome: "OK",
    });
    pushToast("info", "Báo cáo demo: chức năng xuất sẽ nối API khi có backend");
  },

  async deniedAccessDemo(resource: string): Promise<void> {
    const user = getState().user;
    appendAudit({
      actorId: user?.id ?? "?",
      action: "Truy cập trái phép",
      resource,
      detail: "Truy cập ngoài phạm vi được giao",
      outcome: "DENIED",
    });
    pushToast("error", "Truy cập bị từ chối — đã ghi nhật ký kiểm toán");
  },
};

export function personLabel(id: string): string {
  return personName(id);
}
