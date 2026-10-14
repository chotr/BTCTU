import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import type { AuditEvent, NewAuditEvent } from "@/db/schema";
import type { AuditDbExecutor, WriteAuditInput } from "./audit.types";
import { AuditService } from "./audit.service";

// Minimal stand-in for the drizzle insert chain so the repository/service can be
// exercised without a live PostgreSQL connection.
function createFakeDb() {
  const rows: AuditEvent[] = [];

  const executor = {
    insert(table: unknown) {
      void table;
      return {
        values(values: NewAuditEvent) {
          return {
            async returning(): Promise<AuditEvent[]> {
              const row: AuditEvent = {
                id: randomUUID(),
                requestId: values.requestId,
                actorId: values.actorId ?? null,
                sessionId: values.sessionId ?? null,
                action: values.action,
                resourceType: values.resourceType,
                resourceId: values.resourceId ?? null,
                outcome: values.outcome,
                detail: values.detail ?? null,
                createdAt: new Date("2026-10-14T00:00:00.000Z"),
              };
              rows.push(row);
              return [row];
            },
          };
        },
      };
    },
  } as unknown as AuditDbExecutor;

  return { executor, rows };
}

function baseInput(overrides: Partial<WriteAuditInput> = {}): WriteAuditInput {
  return {
    requestId: "req-123",
    actorId: "u-leader",
    sessionId: randomUUID(),
    action: "create_task",
    resourceType: "task",
    resourceId: "NV-2401",
    outcome: "SUCCESS",
    detail: "Assigned to Lê Quốc Bảo",
    ...overrides,
  };
}

describe("AuditService", () => {
  it("creates an audit event", async () => {
    const { executor, rows } = createFakeDb();
    const service = new AuditService(executor);

    const event = await service.record(baseInput());

    expect(rows).toHaveLength(1);
    expect(event.id).toBeTruthy();
    expect(event.createdAt).toBeInstanceOf(Date);
    expect(event.action).toBe("create_task");
    expect(event.resourceType).toBe("task");
    expect(event.resourceId).toBe("NV-2401");
  });

  it("keeps the request id verbatim", async () => {
    const { executor } = createFakeDb();
    const service = new AuditService(executor);

    // Not a UUID: a client-supplied correlation id must survive untouched while
    // the column stays a string.
    const event = await service.record(baseInput({ requestId: "abc" }));

    expect(event.requestId).toBe("abc");
  });

  it("keeps actor id and session id", async () => {
    const { executor } = createFakeDb();
    const service = new AuditService(executor);
    const sessionId = randomUUID();

    const event = await service.record(
      baseInput({ actorId: "u-staff", sessionId }),
    );

    expect(event.actorId).toBe("u-staff");
    expect(event.sessionId).toBe(sessionId);
  });

  it("allows a missing actor and session", async () => {
    const { executor } = createFakeDb();
    const service = new AuditService(executor);

    const event = await service.record(
      baseInput({ actorId: undefined, sessionId: undefined }),
    );

    expect(event.actorId).toBeNull();
    expect(event.sessionId).toBeNull();
  });

  it("stores success and denied outcomes separately", async () => {
    const { executor, rows } = createFakeDb();
    const service = new AuditService(executor);

    await service.record(baseInput({ outcome: "SUCCESS" }));
    await service.record(baseInput({ outcome: "DENIED" }));
    await service.record(baseInput({ outcome: "FAILED" }));

    expect(rows.map((row) => row.outcome)).toEqual([
      "SUCCESS",
      "DENIED",
      "FAILED",
    ]);
  });

  it("treats detail as optional", async () => {
    const { executor } = createFakeDb();
    const service = new AuditService(executor);

    const event = await service.record(baseInput({ detail: undefined }));

    expect(event.detail).toBeNull();
  });

  it("ignores unknown fields so secrets cannot be persisted", async () => {
    const { executor } = createFakeDb();
    const service = new AuditService(executor);

    // A caller forcing extra keys past the type guard must not widen the schema.
    const event = await service.record({
      ...baseInput(),
      accessToken: "eyJhbGciOi...",
      password: "hunter2",
    } as WriteAuditInput);

    expect(Object.keys(event).sort()).toEqual([
      "action",
      "actorId",
      "createdAt",
      "detail",
      "id",
      "outcome",
      "requestId",
      "resourceId",
      "resourceType",
      "sessionId",
    ]);
  });

  it("writes through an injected transaction executor", async () => {
    const { executor: pool } = createFakeDb();
    const { executor: transaction, rows } = createFakeDb();
    const service = new AuditService(pool);

    await service.record(baseInput(), transaction);

    expect(rows).toHaveLength(1);
  });
});
