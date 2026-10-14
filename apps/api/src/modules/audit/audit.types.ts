import type { Database } from "@/db/client";

import {
  AUDIT_OUTCOMES,
  AUDIT_REQUEST_ID_MAX_LENGTH,
  type AuditOutcome,
} from "@/db/schema/audit-events";

export { AUDIT_OUTCOMES, AUDIT_REQUEST_ID_MAX_LENGTH };
export type { AuditOutcome };

export type WriteAuditInput = {
  requestId: string;
  actorId?: string;
  sessionId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  outcome: AuditOutcome;
  detail?: string;
};

export type AuditDbExecutor = Pick<Database, "insert">;
