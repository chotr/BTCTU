import { describe, expect, it } from "vitest";
import type { User } from "@/db/schema";
import type {
  AccountAdminStore,
  AccountAuditRecord,
  AccountRecordUpdate,
} from "./account-admin.repository";
import {
  AccountAdminService,
  AccountConflictError,
} from "./account-admin.service";

function account(overrides: Partial<User> = {}): User {
  return {
    id: "account-1",
    email: "one@btctu.local",
    directoryActorId: "u-one",
    passwordHash: "hash:old-password",
    status: "ACTIVE",
    accountRole: "USER",
    mustChangePassword: false,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

class MemoryStore implements AccountAdminStore {
  readonly accounts = new Map<string, User>();
  readonly audits: AccountAuditRecord[] = [];
  readonly revokedUserIds: string[] = [];

  constructor(accounts: User[] = []) {
    for (const item of accounts) this.accounts.set(item.id, item);
  }

  transaction<T>(work: (store: AccountAdminStore) => Promise<T>): Promise<T> {
    return work(this);
  }

  async list(): Promise<User[]> {
    return [...this.accounts.values()];
  }

  async findById(id: string): Promise<User | null> {
    return this.accounts.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return (
      [...this.accounts.values()].find(
        (item) => item.email === email.trim().toLowerCase(),
      ) ?? null
    );
  }

  async findByDirectoryActorId(directoryActorId: string): Promise<User | null> {
    return (
      [...this.accounts.values()].find(
        (item) => item.directoryActorId === directoryActorId,
      ) ?? null
    );
  }

  async create(input: {
    email: string;
    directoryActorId: string;
    passwordHash: string;
  }): Promise<User> {
    const created = account({
      id: `account-${this.accounts.size + 1}`,
      email: input.email.trim().toLowerCase(),
      directoryActorId: input.directoryActorId,
      passwordHash: input.passwordHash,
      mustChangePassword: true,
    });
    this.accounts.set(created.id, created);
    return created;
  }

  async update(id: string, input: AccountRecordUpdate): Promise<User | null> {
    const current = this.accounts.get(id);
    if (!current) return null;
    const updated = {
      ...current,
      ...input,
      email: input.email?.trim().toLowerCase() ?? current.email,
      updatedAt: new Date(),
    };
    this.accounts.set(id, updated);
    return updated;
  }

  async revokeAllSessions(userId: string): Promise<void> {
    this.revokedUserIds.push(userId);
  }

  async recordAudit(input: AccountAuditRecord): Promise<void> {
    this.audits.push(input);
  }
}

const context = {
  requestId: "request-1",
  actorUserId: "admin-1",
  sessionId: "session-1",
};

describe("AccountAdminService", () => {
  it("creates one account for an available person", async () => {
    const store = new MemoryStore();
    const service = new AccountAdminService(store, {
      hash: async (value) => `hash:${value}`,
    });

    const created = await service.create(
      {
        email: "New.User@btctu.local",
        directoryActorId: "u-new",
        initialPassword: "temporary-password",
      },
      context,
    );

    expect(created).toMatchObject({
      email: "new.user@btctu.local",
      directoryActorId: "u-new",
      accountRole: "USER",
      mustChangePassword: true,
    });
    expect(store.audits).toMatchObject([
      { action: "account.created", actorUserId: "admin-1" },
    ]);
  });

  it("rejects an email or directory person already linked to another account", async () => {
    const store = new MemoryStore([account()]);
    const service = new AccountAdminService(store, {
      hash: async (value) => `hash:${value}`,
    });

    await expect(
      service.create(
        {
          email: "one@btctu.local",
          directoryActorId: "u-new",
          initialPassword: "temporary-password",
        },
        context,
      ),
    ).rejects.toBeInstanceOf(AccountConflictError);

    await expect(
      service.create(
        {
          email: "new@btctu.local",
          directoryActorId: "u-one",
          initialPassword: "temporary-password",
        },
        context,
      ),
    ).rejects.toMatchObject({ field: "directoryActorId" });
  });

  it("revokes sessions when an account is disabled or reset", async () => {
    const store = new MemoryStore([account()]);
    const service = new AccountAdminService(store, {
      hash: async (value) => `hash:${value}`,
    });

    await service.update("account-1", { status: "DISABLED" }, context);
    await service.resetPassword("account-1", "new-temporary-password", context);

    expect(store.revokedUserIds).toEqual(["account-1", "account-1"]);
    expect(store.accounts.get("account-1")).toMatchObject({
      status: "DISABLED",
      mustChangePassword: true,
      passwordHash: "hash:new-temporary-password",
    });
    expect(store.audits.map((event) => event.action)).toEqual([
      "account.disabled",
      "account.password_reset",
    ]);
  });
});
