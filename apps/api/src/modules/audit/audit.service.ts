import type { AuditEvent } from "@/db/schema";
import { AuditRepository } from "./audit.repository";
import type { AuditDbExecutor, WriteAuditInput } from "./audit.types";

export class AuditService {
  constructor(private readonly db: AuditDbExecutor) {}

  async record(
    input: WriteAuditInput,
    db: AuditDbExecutor = this.db,
  ): Promise<AuditEvent> {
    return new AuditRepository(db).create(input);
  }
}
