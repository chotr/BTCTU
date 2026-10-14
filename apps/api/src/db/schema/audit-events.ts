import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const AUDIT_OUTCOMES = ["SUCCESS", "DENIED", "FAILED"] as const;

export type AuditOutcome = (typeof AUDIT_OUTCOMES)[number];

export const AUDIT_REQUEST_ID_MAX_LENGTH = 128;

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),

    requestId: varchar("request_id", {
      length: AUDIT_REQUEST_ID_MAX_LENGTH,
    }).notNull(),

    actorId: varchar("actor_id", { length: 255 }),

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
    check(
      "audit_events_outcome_check",
      sql`${table.outcome} in ('SUCCESS', 'DENIED', 'FAILED')`,
    ),
    index("audit_events_actor_id_idx").on(table.actorId),
    index("audit_events_request_id_idx").on(table.requestId),
    index("audit_events_created_at_idx").on(table.createdAt),
  ],
);

export type AuditEvent = typeof auditEvents.$inferSelect;
export type NewAuditEvent = typeof auditEvents.$inferInsert;
