import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

// Explicit fields only. No arbitrary JSON payload so secrets, tokens and file
// content cannot slip into the audit stream through a generic column.
export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),

    // Client-supplied correlation values are not guaranteed to be UUIDs yet,
    // so this stays a string until an internal/external ID split is agreed.
    requestId: varchar("request_id", { length: 128 }).notNull(),

    // Actor/person identity is still mocked as "u-leader"/"u-staff"; keep it a
    // string so the schema does not assume a UUID mapping that is unconfirmed.
    actorId: varchar("actor_id", { length: 255 }),

    // Sessions are already real UUIDs.
    sessionId: uuid("session_id"),

    action: varchar("action", { length: 100 }).notNull(),

    resourceType: varchar("resource_type", { length: 100 }).notNull(),

    resourceId: varchar("resource_id", { length: 255 }),

    outcome: varchar("outcome", { length: 32 }).notNull(),

    detail: text("detail"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("audit_events_actor_id_idx").on(table.actorId),
    index("audit_events_request_id_idx").on(table.requestId),
    index("audit_events_created_at_idx").on(table.createdAt),
  ],
);

export type AuditEvent = typeof auditEvents.$inferSelect;
export type NewAuditEvent = typeof auditEvents.$inferInsert;
