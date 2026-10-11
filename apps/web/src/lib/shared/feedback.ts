import { appendAudit, getState, pushToast } from "@/lib/store";

/**
 * Single deny path for every guarded action: audit the rejection and surface
 * exactly one error toast, then return `false` so callers can `return deny(...)`.
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
