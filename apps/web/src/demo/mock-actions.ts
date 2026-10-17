import {
  appendAudit,
  getState,
  hydrateStore,
  pushToast,
  resetWorkspace,
  setUser,
} from "@/lib/store";
import { demoAccounts, resolveAppUser } from "@/lib/identity";
import { taskActions } from "@/lib/tasks";
import { evaluationActions } from "@/lib/evaluation";
import {
  catalogCsvTemplate,
  masterActions,
  previewCatalogCsv,
} from "@/lib/master-data";
import {
  PROFILES,
  previewPayload,
  saveMappings,
  simulateSync,
} from "@/lib/integration";
import { exportReport } from "@/lib/exports";

export const mockActions = {
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
  async loginWithCredentials(
    _email: string,
    _password: string,
  ): Promise<{
    ok: boolean;
    message?: string;
    passwordChangeRequired?: boolean;
  }> {
    return {
      ok: false,
      message:
        "Không gian mô phỏng dùng màn đăng nhập nhanh, không nhận mật khẩu.",
    };
  },
  async changePassword(
    _currentPassword: string,
    _newPassword: string,
  ): Promise<{ ok: boolean; message?: string }> {
    return { ok: false, message: "Màn đổi mật khẩu không dùng trong không gian mô phỏng." };
  },
  async logout(): Promise<void> {
    const user = getState().user;
    if (user) {
      appendAudit({
        actorId: user.id,
        action: "Đăng xuất",
        resource: "Phiên làm việc",
        detail: "",
        outcome: "OK",
      });
    }
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
