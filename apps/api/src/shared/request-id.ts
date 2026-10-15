import { AUDIT_REQUEST_ID_MAX_LENGTH } from "@/db/schema/audit-events";

export function validExternalRequestId(
  value: string | undefined,
): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.length > AUDIT_REQUEST_ID_MAX_LENGTH) {
    return undefined;
  }
  return trimmed;
}
