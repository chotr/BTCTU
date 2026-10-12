import {
  appendAudit,
  getState,
  hydrateStore,
  pushToast,
  setUser,
} from "./store";
import { USERS } from "./mock";
import { policy } from "./policy";
import { personName } from "./shared/names";
import { taskActions } from "./tasks";
import { evaluationActions } from "./evaluation";
import { exportReport } from "./exports";
import type { AppUser } from "./types";
export const perm = policy;
export const api = {
  ...taskActions,
  ...evaluationActions,
  async login(userId: string): Promise<void> {
    hydrateStore();
    const s = getState();
    const person = s.people.find((p) => p.id === userId);
    const department = s.departments.find((d) => d.id === person?.departmentId);
    const user: AppUser | undefined =
      USERS.find((u) => u.id === userId) ??
      (person
        ? {
            id: person.id,
            name: person.name,
            title: person.title,
            role:
              department?.headId === person.id ? "truong_phong" : "cong_chuc",
            departmentId: person.departmentId,
            departmentName: department?.name ?? null,
          }
        : undefined);
    if (!user) {
      pushToast("error", "Tài khoản không tồn tại");
      return;
    }
    setUser(user);
    appendAudit({
      actorId: user.id,
      action: "Đăng nhập",
      resource: "Phiên làm việc",
      detail: `Vai trò: ${user.role}`,
      outcome: "OK",
    });
  },
  async logout(): Promise<void> {
    const user = getState().user;
    if (user)
      appendAudit({
        actorId: user.id,
        action: "Đăng xuất",
        resource: "Phiên làm việc",
        detail: "",
        outcome: "OK",
      });
    setUser(null);
  },
  async exportReport(label: string): Promise<void> {
    exportReport(
      label.includes("Nhật ký")
        ? "audit"
        : label.includes("đánh giá")
          ? "evaluations"
          : "tasks",
    );
  },
  async deniedAccess(resource: string): Promise<void> {
    appendAudit({
      actorId: getState().user?.id ?? "?",
      action: "Truy cập bị từ chối",
      resource,
      detail: "Ngoài phạm vi được phân quyền",
      outcome: "DENIED",
    });
    pushToast("error", "Không có quyền truy cập — đã ghi nhật ký");
  },
};
export function personLabel(id: string): string {
  return (
    personName(getState(), id) ?? USERS.find((u) => u.id === id)?.name ?? id
  );
}
