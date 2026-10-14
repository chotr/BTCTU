import type { AuditEvent } from "@/db/schema";
import { AuditRepository } from "./audit.repository";
import type { AuditDbExecutor, WriteAuditInput } from "./audit.types";

// Persistence only for now. Redaction, structured metadata, retention and
// tamper protection are intentionally deferred.
export class AuditService {
  constructor(private readonly db: AuditDbExecutor) {}

  async record(
    input: WriteAuditInput,
    db: AuditDbExecutor = this.db,
  ): Promise<AuditEvent> {
    return new AuditRepository(db).create(input);
  }
}
