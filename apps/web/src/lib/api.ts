import {
  appendAudit,
  getState,
  hydrateStore,
  pushToast,
  resetWorkspace,
  setUser,
} from "./store";
import { policy } from "./policy";
import { personName } from "./shared/names";
import { demoAccounts, resolveAppUser } from "./identity";
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
import { apiModeActions } from "./api-adapter";
import { runtimeConfig } from "./runtime-config";

/**
 * Điểm gọi thao tác duy nhất dành cho các màn hình.
 *
 * Phần triển khai hiện chạy cục bộ trên trình duyệt. Khi thay bằng lớp gọi API,
 * cần giữ tên hàm và kiểu trả về để màn hình không phụ thuộc trực tiếp vào dữ
 * liệu mẫu, bộ xử lý cục bộ hoặc hàm thay đổi kho trạng thái.
 */
export const perm = policy;
const localApi = {
  ...taskActions,
  ...evaluationActions,
  ...masterActions,
  saveMappings,
  simulateSync,
  previewPayload,
  exportReport,
  resetWorkspace,
  accounts: demoAccounts,
  profiles: PROFILES,
  catalogTemplate: catalogCsvTemplate,
  previewCatalogCsv,
  async login(userId: string): Promise<boolean> {
    hydrateStore();
    const user = resolveAppUser(getState(), userId);
    if (!user) {
      pushToast("error", "Tài khoản không tồn tại");
      return false;
    }
    setUser(user);
    appendAudit({
      actorId: user.id,
      action: "Đăng nhập",
      resource: "Phiên làm việc",
      detail: `Vai trò: ${user.role}`,
      outcome: "OK",
    });
    return true;
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

export const api =
  runtimeConfig.dataSource === "api"
    ? { ...localApi, ...apiModeActions }
    : localApi;

export function personLabel(id: string): string {
  const state = getState();
  return personName(state, id) ?? resolveAppUser(state, id)?.name ?? id;
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
