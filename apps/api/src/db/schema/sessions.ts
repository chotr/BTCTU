import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    refreshTokenHash: text("refresh_token_hash")
      .notNull()
      .unique(),

    previousTokenHash: text("previous_token_hash"),

    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }).notNull(),

    revokedAt: timestamp("revoked_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    lastUsedAt: timestamp("last_used_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
    index("sessions_previous_token_hash_idx").on(table.previousTokenHash),
  ],
);

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
