import type { AccountRole, AccountStatus } from "@btctu/shared";
import type { User } from "@/db/schema";
import { normalizeEmail } from "@/shared/string";
import type {
  AccountAdminStore,
  AccountRecordUpdate,
} from "./account-admin.repository";

type PasswordHasher = {
  hash(password: string): Promise<string>;
};

export type AccountAuditContext = {
  requestId: string;
  actorUserId: string;
  sessionId: string;
};

export type CreateManagedAccountInput = {
  email: string;
  directoryActorId: string;
  initialPassword: string;
};

export type UpdateManagedAccountInput = {
  email?: string;
  directoryActorId?: string;
  status?: AccountStatus;
};

export interface AccountAdminPort {
  list(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  create(
    input: CreateManagedAccountInput,
    context: AccountAuditContext,
  ): Promise<User>;
  update(
    id: string,
    input: UpdateManagedAccountInput,
    context: AccountAuditContext,
  ): Promise<User>;
  resetPassword(
    id: string,
    temporaryPassword: string,
    context: AccountAuditContext,
  ): Promise<User>;
  setAccountRole(
    id: string,
    accountRole: AccountRole,
    context: AccountAuditContext,
  ): Promise<User>;
}

export class AccountNotFoundError extends Error {
  constructor() {
    super("Account does not exist");
    this.name = "AccountNotFoundError";
  }
}

export class AccountConflictError extends Error {
  constructor(readonly field: "email" | "directoryActorId") {
    super(`${field} is already in use`);
    this.name = "AccountConflictError";
  }
}

export class AccountAdminService implements AccountAdminPort {
  constructor(
    private readonly store: AccountAdminStore,
    private readonly passwords: PasswordHasher,
  ) {}

  list(): Promise<User[]> {
    return this.store.list();
  }

  findById(id: string): Promise<User | null> {
    return this.store.findById(id);
  }

  async create(
    input: CreateManagedAccountInput,
    context: AccountAuditContext,
  ): Promise<User> {
    const passwordHash = await this.passwords.hash(input.initialPassword);
    try {
      return await this.store.transaction(async (store) => {
        await this.ensureEmailAvailable(input.email, undefined, store);
        await this.ensureDirectoryActorAvailable(
          input.directoryActorId,
          undefined,
          store,
        );
        const account = await store.create({ ...input, passwordHash });
        await this.audit(context, "account.created", account.id, account.email, store);
        return account;
      });
    } catch (error) {
      throw this.asConflict(error);
    }
  }

  async update(
    id: string,
    input: UpdateManagedAccountInput,
    context: AccountAuditContext,
  ): Promise<User> {
    try {
      return await this.store.transaction(async (store) => {
        const current = await this.requireAccount(id, store);
        if (input.email && normalizeEmail(input.email) !== current.email) {
          await this.ensureEmailAvailable(input.email, id, store);
        }
        if (
          input.directoryActorId &&
          input.directoryActorId !== current.directoryActorId
        ) {
          await this.ensureDirectoryActorAvailable(input.directoryActorId, id, store);
        }

        const account = await store.update(id, input);
        if (!account) throw new AccountNotFoundError();
        if (
          input.status === "DISABLED" ||
          input.email !== undefined ||
          input.directoryActorId !== undefined
        ) {
          await store.revokeAllSessions(id);
        }
        const action =
          input.status === "DISABLED"
            ? "account.disabled"
            : input.status === "ACTIVE" && current.status === "DISABLED"
              ? "account.enabled"
              : "account.updated";
        await this.audit(context, action, account.id, account.email, store);
        return account;
      });
    } catch (error) {
      throw this.asConflict(error);
    }
  }

  async resetPassword(
    id: string,
    temporaryPassword: string,
    context: AccountAuditContext,
  ): Promise<User> {
    const passwordHash = await this.passwords.hash(temporaryPassword);
    return this.store.transaction(async (store) => {
      await this.requireAccount(id, store);
      const account = await store.update(id, {
        passwordHash,
        mustChangePassword: true,
      });
      if (!account) throw new AccountNotFoundError();
      await store.revokeAllSessions(id);
      await this.audit(
        context,
        "account.password_reset",
        account.id,
        account.email,
        store,
      );
      return account;
    });
  }

  async setAccountRole(
    id: string,
    accountRole: AccountRole,
    context: AccountAuditContext,
  ): Promise<User> {
    return this.store.transaction(async (store) => {
      await this.requireAccount(id, store);
      const account = await store.update(id, { accountRole });
      if (!account) throw new AccountNotFoundError();
      await store.revokeAllSessions(id);
      await this.audit(
        context,
        accountRole === "ACCOUNT_ADMIN"
          ? "account.admin_granted"
          : "account.admin_revoked",
        account.id,
        account.email,
        store,
      );
      return account;
    });
  }

  private async requireAccount(id: string, store = this.store): Promise<User> {
    const account = await store.findById(id);
    if (!account) throw new AccountNotFoundError();
    return account;
  }

  private async ensureEmailAvailable(
    email: string,
    exceptId?: string,
    store = this.store,
  ) {
    const account = await store.findByEmail(email);
    if (account && account.id !== exceptId)
      throw new AccountConflictError("email");
  }

  private async ensureDirectoryActorAvailable(
    directoryActorId: string,
    exceptId?: string,
    store = this.store,
  ) {
    const account = await store.findByDirectoryActorId(directoryActorId);
    if (account && account.id !== exceptId) {
      throw new AccountConflictError("directoryActorId");
    }
  }

  private audit(
    context: AccountAuditContext,
    action: string,
    resourceId: string,
    detail: string,
    store = this.store,
  ): Promise<void> {
    return store.recordAudit({
      ...context,
      action,
      resourceId,
      detail,
    });
  }

  private asConflict(error: unknown): unknown {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505"
    ) {
      const constraint =
        "constraint" in error && typeof error.constraint === "string"
          ? error.constraint
          : "";
      return new AccountConflictError(
        constraint.includes("directory_actor")
          ? "directoryActorId"
          : "email",
      );
    }
    return error;
  }
}
