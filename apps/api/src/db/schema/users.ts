import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const userStatusEnum = pgEnum("user_status", [
  "ACTIVE",
  "DISABLED",
]);

export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .defaultRandom(),

  email: varchar("email", { length: 255 })
    .notNull()
    .unique(),

  passwordHash: text("password_hash")
    .notNull(),

  status: userStatusEnum("status")
    .notNull()
    .default("ACTIVE"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;