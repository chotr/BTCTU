import {
  boolean,
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userStatusEnum = pgEnum("user_status", ["ACTIVE", "DISABLED"]);

export const accountRoleEnum = pgEnum("account_role", [
  "USER",
  "ACCOUNT_ADMIN",
  "ROOT",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    email: varchar("email", { length: 255 }).notNull().unique(),

    directoryActorId: varchar("directory_actor_id", { length: 255 }),

    passwordHash: text("password_hash").notNull(),

    status: userStatusEnum("status").notNull().default("ACTIVE"),

    accountRole: accountRoleEnum("account_role").notNull().default("USER"),

    mustChangePassword: boolean("must_change_password")
      .notNull()
      .default(false),

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
  },
  (table) => [
    uniqueIndex("users_directory_actor_id_unique")
      .on(table.directoryActorId)
      .where(sql`${table.directoryActorId} is not null`),
    uniqueIndex("users_one_root_unique")
      .on(table.accountRole)
      .where(sql`${table.accountRole} = 'ROOT'`),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
