import type { Database } from "@/db/client";

export const AUDIT_OUTCOMES = ["SUCCESS", "DENIED", "FAILED"] as const;

export type AuditOutcome = (typeof AUDIT_OUTCOMES)[number];

// Typed input only. Audit deliberately does not accept a raw request body or a
// generic JSON payload, so tokens, passwords and file content have no field to
// travel through.
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

// Anything that can insert a row: either the pooled database or a transaction
// handle, so a business mutation and its audit event can share one transaction.
export type AuditDbExecutor = Pick<Database, "insert">;
