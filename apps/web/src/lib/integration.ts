import {
  appendAudit,
  getState,
  pushToast,
  setState,
  type SyncRun,
} from "./store";
import { canManage } from "./policy";
export const PROFILES = {
  personnel: {
    name: "Hồ sơ nhân sự · QĐ607",
    contract: "OAuth client credentials + JWT (profile chờ phê duyệt)",
    fields: ["personnelCode", "fullName", "organizationCode"],
    source: "QĐ607 / QĐ308 · ánh xạ chờ phê duyệt",
  },
  lgsp: {
    name: "Kết nối LGSP · HD07",
    contract:
      "Profile cổng tích hợp HD07 riêng; không đồng nhất với OAuth QĐ607",
    fields: ["personnelCode", "fullName", "organizationCode"],
    source: "HD07 / QĐ348 · luồng chia sẻ chờ phê duyệt",
  },
} as const;
export type ProfileKey = keyof typeof PROFILES;
function guard(action: string) {
  const u = getState().user;
  if (canManage(u)) return true;
  appendAudit({
    actorId: u?.id ?? "?",
    action,
    resource: "integration",
    detail: "Không có quyền quản lý kết nối dữ liệu",
    outcome: "DENIED",
  });
  pushToast("error", "Chỉ tài khoản lãnh đạo được quản lý kết nối dữ liệu");
  return false;
}
export function saveMappings(
  mappings: ReturnType<typeof getState>["integration"]["mappings"],
): boolean {
  if (!guard("Cấu hình mapping")) return false;
  const fields = ["person.id", "person.name", "department.code"],
    targets = ["personnelCode", "fullName", "organizationCode"];
  if (
    mappings.length !== 3 ||
    new Set(mappings.map((m) => m.field)).size !== 3 ||
    new Set(mappings.map((m) => m.target)).size !== 3 ||
    mappings.some(
      (m) => !fields.includes(m.field) || !targets.includes(m.target),
    )
  ) {
    pushToast(
      "error",
      "Mapping phải đủ 3 trường và không trùng cột đích trong allowlist.",
    );
    return false;
  }
  setState((s) => ({
    ...s,
    integration: { ...s.integration, mappings: structuredClone(mappings) },
  }));
  appendAudit({
    actorId: getState().user!.id,
    action: "Cấu hình mapping",
    resource: "integration",
    detail: "Ánh xạ QĐ308/QĐ607; chỉ trường trong allowlist",
    outcome: "OK",
  });
  pushToast("success", "Đã lưu ánh xạ dữ liệu");
  return true;
}
export function previewPayload() {
  const s = getState();
  return s.people
    .slice(0, 5)
    .map((p) =>
      Object.fromEntries(
        s.integration.mappings.map((m) => [
          m.target,
          m.field === "person.id"
            ? p.id
            : m.field === "person.name"
              ? p.name
              : (s.departments.find((d) => d.id === p.departmentId)?.code ??
                ""),
        ]),
      ),
    );
}
export async function simulateSync(
  profile: ProfileKey,
  purpose: string,
  fail: boolean,
  retryOf?: string,
): Promise<boolean> {
  if (!guard("Kiểm tra đồng bộ")) return false;
  if (!PROFILES[profile] || purpose.trim().length < 5) {
    pushToast(
      "error",
      "Chọn profile và nhập mục đích sử dụng ít nhất 5 ký tự.",
    );
    return false;
  }
  const s = getState();
  const previous = retryOf
    ? s.integration.runs.find((r) => r.id === retryOf)
    : null;
  if (
    retryOf &&
    (!previous ||
      previous.status !== "FAILED" ||
      s.integration.runs.some(
        (r) => r.retryOf === retryOf && r.status === "SUCCESS",
      ))
  ) {
    pushToast("error", "Lần đồng bộ không thể thử lại hoặc đã được xử lý.");
    return false;
  }
  const checkpoint = fail
    ? s.integration.checkpoint
    : String(Number(s.integration.checkpoint) + 1);
  const run: SyncRun = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    profile,
    purpose: purpose.trim(),
    status: fail ? "FAILED" : "SUCCESS",
    records: fail ? 0 : previewPayload().length,
    checkpoint,
    correlationId: `dev-${crypto.randomUUID().slice(0, 8)}`,
    error: fail
      ? "DEV_TIMEOUT: kết nối thử bị gián đoạn; không có yêu cầu mạng ngoài."
      : null,
    ...(retryOf ? { retryOf } : {}),
  };
  setState((current) => ({
    ...current,
    integration: {
      ...current.integration,
      checkpoint,
      runs: [run, ...current.integration.runs],
    },
  }));
  appendAudit({
    actorId: s.user!.id,
    action: retryOf ? "Thử lại kiểm tra đồng bộ" : "Kiểm tra đồng bộ",
    resource: "integration",
    detail: `${PROFILES[profile].name}; ${run.status}; ${run.correlationId}; mục đích ${purpose}`,
    outcome: fail ? "DENIED" : "OK",
  });
  pushToast(
    fail ? "error" : "success",
    fail
      ? "Đã ghi nhận lỗi kiểm thử; checkpoint không đổi"
      : "Kiểm tra đồng bộ thành công; đã lưu checkpoint mới",
  );
  return !fail;
}
