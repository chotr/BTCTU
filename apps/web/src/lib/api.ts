import {
  appendAudit,
  getState,
  hydrateStore,
  pushToast,
  resetDemo,
  setUser,
} from "./store";
import { policy } from "./policy";
import { personName } from "./shared/names";
import { demoAccounts, resolveDemoUser } from "./identity";
import { taskActions, taskPeriodLocked } from "./tasks";
import { RESULT_QUALITY } from "./domain/quality";
import {
  canCalculateEvaluation,
  canSelfEvaluate,
  evaluationActions,
  evaluationLabel,
  evaluationTotal,
} from "./evaluation";
import {
  catalogCsvTemplate,
  masterActions,
  previewCatalogCsv,
  type ImportRow,
} from "./master-data";
import {
  PROFILES,
  previewPayload,
  saveMappings,
  simulateSync,
  type ProfileKey,
} from "./integration";
import { exportReport, type ReportKind } from "./exports";

/**
 * The only command surface screens may call.
 * This binding is the in-browser mock. Replacing it with a fetch client must
 * keep these method names and return values; screens must not import the
 * local engines, fixtures, or store mutators directly.
 */
export const perm = policy;
export const api = {
  ...taskActions,
  ...evaluationActions,
  ...masterActions,
  saveMappings,
  simulateSync,
  previewPayload,
  exportReport,
  resetDemo,
  accounts: demoAccounts,
  profiles: PROFILES,
  catalogTemplate: catalogCsvTemplate,
  previewCatalogCsv,
  async login(userId: string): Promise<void> {
    hydrateStore();
    const user = resolveDemoUser(getState(), userId);
    if (!user) {
      pushToast("error", "Tài khoản mẫu không tồn tại");
      return;
    }
    setUser(user);
    appendAudit({
      actorId: user.id,
      action: "Đăng nhập demo",
      resource: "Phiên làm việc",
      detail: "Vai trò mô phỏng: " + user.role,
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
  async deniedAccessDemo(resource: string): Promise<void> {
    appendAudit({
      actorId: getState().user?.id ?? "?",
      action: "Truy cập bị từ chối",
      resource,
      detail: "Ngoài phạm vi mô phỏng",
      outcome: "DENIED",
    });
    pushToast("error", "Không có quyền truy cập — đã ghi nhật ký");
  },
};

export function personLabel(id: string): string {
  const state = getState();
  return personName(state, id) ?? resolveDemoUser(state, id)?.name ?? id;
}

export {
  RESULT_QUALITY,
  taskPeriodLocked,
  canCalculateEvaluation,
  canSelfEvaluate,
  evaluationLabel,
  evaluationTotal,
  catalogCsvTemplate,
  previewCatalogCsv,
  PROFILES,
  previewPayload,
};
export type { ImportRow, ProfileKey, ReportKind };
