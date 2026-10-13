import { appendAudit, getState, pushToast } from "@/lib/store";

/**
 * Đường từ chối duy nhất cho mọi thao tác có kiểm soát: ghi audit lần từ chối và
 * hiện đúng một thông báo lỗi, rồi trả `false` để nơi gọi dùng `return deny(...)`.
 */
export function deny(action: string, resource: string, detail: string): false {
  appendAudit({
    actorId: getState().user?.id ?? "anonymous",
    action,
    resource,
    detail,
    outcome: "DENIED",
  });
  pushToast("error", detail);
  return false;
}
