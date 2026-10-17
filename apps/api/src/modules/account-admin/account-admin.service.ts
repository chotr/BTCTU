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
    await this.ensureEmailAvailable(input.email);
    await this.ensureDirectoryActorAvailable(input.directoryActorId);

    const passwordHash = await this.passwords.hash(input.initialPassword);
    const account = await this.store.create({ ...input, passwordHash });
    await this.audit(context, "account.created", account.id, account.email);
    return account;
  }

  async update(
    id: string,
    input: UpdateManagedAccountInput,
    context: AccountAuditContext,
  ): Promise<User> {
    const current = await this.requireAccount(id);
    if (input.email && normalizeEmail(input.email) !== current.email) {
      await this.ensureEmailAvailable(input.email, id);
    }
    if (
      input.directoryActorId &&
      input.directoryActorId !== current.directoryActorId
    ) {
      await this.ensureDirectoryActorAvailable(input.directoryActorId, id);
    }

    const changes: AccountRecordUpdate = input;
    const account = await this.store.update(id, changes);
    if (!account) throw new AccountNotFoundError();

    if (
      input.status === "DISABLED" ||
      input.email !== undefined ||
      input.directoryActorId !== undefined
    ) {
      await this.store.revokeAllSessions(id);
    }

    const action =
      input.status === "DISABLED"
        ? "account.disabled"
        : input.status === "ACTIVE" && current.status === "DISABLED"
          ? "account.enabled"
          : "account.updated";
    await this.audit(context, action, account.id, account.email);
    return account;
  }

  async resetPassword(
    id: string,
    temporaryPassword: string,
    context: AccountAuditContext,
  ): Promise<User> {
    await this.requireAccount(id);
    const passwordHash = await this.passwords.hash(temporaryPassword);
    const account = await this.store.update(id, {
      passwordHash,
      mustChangePassword: true,
    });
    if (!account) throw new AccountNotFoundError();

    await this.store.revokeAllSessions(id);
    await this.audit(
      context,
      "account.password_reset",
      account.id,
      account.email,
    );
    return account;
  }

  async setAccountRole(
    id: string,
    accountRole: AccountRole,
    context: AccountAuditContext,
  ): Promise<User> {
    await this.requireAccount(id);
    const account = await this.store.update(id, { accountRole });
    if (!account) throw new AccountNotFoundError();

    await this.store.revokeAllSessions(id);
    await this.audit(
      context,
      accountRole === "ACCOUNT_ADMIN"
        ? "account.admin_granted"
        : "account.admin_revoked",
      account.id,
      account.email,
    );
    return account;
  }

  private async requireAccount(id: string): Promise<User> {
    const account = await this.store.findById(id);
    if (!account) throw new AccountNotFoundError();
    return account;
  }

  private async ensureEmailAvailable(email: string, exceptId?: string) {
    const account = await this.store.findByEmail(email);
    if (account && account.id !== exceptId)
      throw new AccountConflictError("email");
  }

  private async ensureDirectoryActorAvailable(
    directoryActorId: string,
    exceptId?: string,
  ) {
    const account = await this.store.findByDirectoryActorId(directoryActorId);
    if (account && account.id !== exceptId) {
      throw new AccountConflictError("directoryActorId");
    }
  }

  private audit(
    context: AccountAuditContext,
    action: string,
    resourceId: string,
    detail: string,
  ): Promise<void> {
    return this.store.recordAudit({
      ...context,
      action,
      resourceId,
      detail,
    });
  }
}
