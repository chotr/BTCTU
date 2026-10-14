import { AUDIT_REQUEST_ID_MAX_LENGTH } from "@/db/schema/audit-events";

// Returns the caller-supplied correlation id only when it is safe to store in
// the audit column; otherwise undefined so the caller can generate its own.
export function validExternalRequestId(
  value: string | undefined,
): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.length > AUDIT_REQUEST_ID_MAX_LENGTH) {
    return undefined;
  }
  return trimmed;
}
