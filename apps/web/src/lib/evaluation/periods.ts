import { appendAudit, getState, pushToast, setState } from "@/lib/store";
import { canLock, canManage } from "@/lib/policy";
import { taskInPeriod } from "@/lib/evaluation-engine";
import { uid, now } from "@/lib/shared/ids";
import { deny } from "@/lib/shared/feedback";
import type { EvaluationPeriod } from "@/lib/types";

export const periodActions = {
  async lockPeriod(id: string): Promise<boolean> {
    const state = getState(),
      user = state.user;
    const period = state.periods.find((row) => row.id === id),
      evaluations = state.evaluations.filter((row) => row.periodId === id);
    if (!user || !canLock(user))
      return deny("Khóa kỳ", id, "Chỉ tài khoản lãnh đạo có quyền khóa kỳ.");
    if (!period || period.status !== "ACTIVE")
      return deny("Khóa kỳ", id, "Kỳ không tồn tại hoặc đã khóa.");
    if (
      !evaluations.length ||
      evaluations.some((ev) => ev.status !== "APPROVED")
    )
      return deny(
        "Khóa kỳ",
        id,
        "Chỉ khóa khi có hồ sơ và mọi hồ sơ trong kỳ đã có quyết định.",
      );
    const at = now();
    setState((current) => ({
      ...current,
      periods: current.periods.map((row) =>
        row.id === id ? { ...row, status: "LOCKED", lockedAt: at } : row,
      ),
      evaluations: current.evaluations.map((ev) =>
        ev.periodId === id
          ? {
              ...ev,
              status: "LOCKED",
              history: [
                ...ev.history,
                {
                  id: uid("h"),
                  at,
                  actorId: user.id,
                  action: "Khóa kỳ",
                  note: "Bảo toàn quyết định và snapshot. Các nhiệm vụ trong kỳ không được sửa.",
                },
              ],
            }
          : ev,
      ),
    }));
    appendAudit({
      actorId: user.id,
      action: "Khóa kỳ",
      resource: id,
      detail: `${evaluations.length} hồ sơ; toàn bộ dữ liệu nhiệm vụ trong kỳ chỉ đọc`,
      outcome: "OK",
    });
    pushToast("success", "Đã khóa kỳ; nhiệm vụ và hồ sơ trong kỳ chỉ được xem");
    return true;
  },

  async reopenPeriod(id: string, reason: string): Promise<boolean> {
    const state = getState(),
      user = state.user;
    const period = state.periods.find((row) => row.id === id);
    if (!user || !canLock(user) || !reason.trim())
      return deny(
        "Mở lại kỳ",
        id,
        "Mở lại kỳ yêu cầu lãnh đạo và lý do cụ thể.",
      );
    if (!period || period.status !== "LOCKED")
      return deny("Mở lại kỳ", id, "Chỉ mở lại kỳ đang khóa.");
    const at = now();
    setState((current) => ({
      ...current,
      periods: current.periods.map((row) =>
        row.id === id
          ? {
              ...row,
              status: "ACTIVE",
              lockedAt: null,
              reopenedAt: at,
              reopenReason: reason.trim(),
            }
          : row,
      ),
      evaluations: current.evaluations.map((ev) =>
        ev.periodId === id
          ? {
              ...ev,
              status: "DRAFT",
              decisionHistory: ev.decision
                ? [...(ev.decisionHistory ?? []), ev.decision]
                : ev.decisionHistory,
              reviewHistory: ev.review
                ? [...(ev.reviewHistory ?? []), ev.review]
                : ev.reviewHistory,
              decision: null,
              review: null,
              self: null,
              revision: (ev.revision ?? 0) + 1,
              history: [
                ...ev.history,
                {
                  id: uid("h"),
                  at,
                  actorId: user.id,
                  action: "Mở lại kỳ · tạo phiên bản nháp",
                  note: reason.trim(),
                },
              ],
            }
          : ev,
      ),
      tasks: current.tasks.map((task) =>
        taskInPeriod(task, period) && task.status === "LOCKED"
          ? { ...task, status: "ACCEPTED" }
          : task,
      ),
    }));
    appendAudit({
      actorId: user.id,
      action: "Mở lại kỳ",
      resource: id,
      detail: reason.trim() + " · giữ nguyên các quyết định và lần tính trước",
      outcome: "OK",
    });
    pushToast(
      "success",
      "Đã mở lại kỳ; hồ sơ trở về nháp, giữ toàn bộ lịch sử",
    );
    return true;
  },

  async createPeriod(input: {
    name: string;
    kind: NonNullable<EvaluationPeriod["kind"]>;
    startDate: string;
    endDate: string;
  }): Promise<boolean> {
    const state = getState(),
      user = state.user;
    if (!user || !canManage(user))
      return deny("Tạo kỳ", input.name, "Bạn không có quyền tạo kỳ đánh giá.");
    if (
      !input.name.trim() ||
      !Number.isFinite(Date.parse(input.startDate)) ||
      !Number.isFinite(Date.parse(input.endDate)) ||
      input.startDate > input.endDate ||
      state.periods.some(
        (row) =>
          row.name.toLocaleLowerCase() ===
          input.name.trim().toLocaleLowerCase(),
      )
    )
      return deny(
        "Tạo kỳ",
        input.name,
        "Tên kỳ phải duy nhất và khoảng ngày hợp lệ.",
      );
    const period: EvaluationPeriod = {
      id: uid("PERIOD"),
      ...input,
      name: input.name.trim(),
      range: `${input.startDate.split("-").reverse().join("/")} – ${input.endDate.split("-").reverse().join("/")}`,
      status: "ACTIVE",
      lockedAt: null,
    };
    setState((current) => ({
      ...current,
      periods: [period, ...current.periods],
    }));
    appendAudit({
      actorId: user.id,
      action: "Tạo kỳ đánh giá",
      resource: period.id,
      detail:
        period.name +
        " · không tự tổng hợp tháng/quý/năm khi chưa có quy tắc được phê duyệt",
      outcome: "OK",
    });
    pushToast("success", "Đã tạo kỳ đánh giá");
    return true;
  },
};
