import { auditEvents } from "@/db";
import type { AuditEvent } from "@/db/schema";
import type { AuditDbExecutor, WriteAuditInput } from "./audit.types";

export class AuditRepository {
  constructor(private readonly db: AuditDbExecutor) {}

  async create(input: WriteAuditInput): Promise<AuditEvent> {
    const [event] = await this.db
      .insert(auditEvents)
      .values({
        requestId: input.requestId,
        actorId: input.actorId,
        sessionId: input.sessionId,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        outcome: input.outcome,
        detail: input.detail,
      })
      .returning();

    return event;
  }
}
