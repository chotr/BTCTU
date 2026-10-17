import { and, asc, eq, isNull } from "drizzle-orm";
import type { AccountRole, AccountStatus } from "@btctu/shared";
import { auditEvents, sessions, users } from "@/db";
import type { Database } from "@/db/client";
import type { User } from "@/db/schema";
import { normalizeEmail } from "@/shared/string";

type AccountAdminDatabase = Pick<Database, "select" | "insert" | "update">;

export type AccountRecordUpdate = {
  email?: string;
  directoryActorId?: string;
  status?: AccountStatus;
  accountRole?: AccountRole;
  passwordHash?: string;
  mustChangePassword?: boolean;
};

export type AccountAuditRecord = {
  requestId: string;
  actorUserId: string;
  sessionId: string;
  action: string;
  resourceId: string;
  detail: string;
};

export interface AccountAdminStore {
  transaction<T>(work: (store: AccountAdminStore) => Promise<T>): Promise<T>;
  list(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByDirectoryActorId(directoryActorId: string): Promise<User | null>;
  create(input: {
    email: string;
    directoryActorId: string;
    passwordHash: string;
  }): Promise<User>;
  update(id: string, input: AccountRecordUpdate): Promise<User | null>;
  revokeAllSessions(userId: string): Promise<void>;
  recordAudit(input: AccountAuditRecord): Promise<void>;
}

export class DatabaseAccountAdminStore implements AccountAdminStore {
  constructor(
    private readonly db: AccountAdminDatabase,
    private readonly transactionRunner: Database = db as Database,
  ) {}

  transaction<T>(work: (store: AccountAdminStore) => Promise<T>): Promise<T> {
    return this.transactionRunner.transaction((tx) =>
      work(new DatabaseAccountAdminStore(tx, this.transactionRunner)),
    );
  }

  async list(): Promise<User[]> {
    return this.db.select().from(users).orderBy(asc(users.email));
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0] ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, normalizeEmail(email)));
    return result[0] ?? null;
  }

  async findByDirectoryActorId(directoryActorId: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.directoryActorId, directoryActorId));
    return result[0] ?? null;
  }

  async create(input: {
    email: string;
    directoryActorId: string;
    passwordHash: string;
  }): Promise<User> {
    const [user] = await this.db
      .insert(users)
      .values({
        email: normalizeEmail(input.email),
        directoryActorId: input.directoryActorId,
        passwordHash: input.passwordHash,
        status: "ACTIVE",
        accountRole: "USER",
        mustChangePassword: true,
      })
      .returning();

    return user;
  }

  async update(id: string, input: AccountRecordUpdate): Promise<User | null> {
    const [user] = await this.db
      .update(users)
      .set({
        ...input,
        ...(input.email ? { email: normalizeEmail(input.email) } : {}),
      })
      .where(eq(users.id, id))
      .returning();

    return user ?? null;
  }

  async revokeAllSessions(userId: string): Promise<void> {
    await this.db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
  }

  async recordAudit(input: AccountAuditRecord): Promise<void> {
    await this.db.insert(auditEvents).values({
      requestId: input.requestId,
      actorId: input.actorUserId,
      sessionId: input.sessionId,
      action: input.action,
      resourceType: "account",
      resourceId: input.resourceId,
      outcome: "SUCCESS",
      detail: input.detail,
    });
  }
}
