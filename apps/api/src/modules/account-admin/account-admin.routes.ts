import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { createAccessTokenGuard } from "@/middleware/authentication";
import type { AuthPort, AuthenticatedUser } from "@/modules/auth/auth.types";
import { formatIssues, problem } from "@/shared/problem";
import type { WorkspaceState } from "@/types";
import {
  AccountConflictError,
  AccountNotFoundError,
  type AccountAdminPort,
} from "./account-admin.service";
import {
  createManagedAccountSchema,
  resetPasswordSchema,
  updateAccountRoleSchema,
  updateManagedAccountSchema,
} from "./account-admin.schema";

export type AccountAdminRouterOptions = {
  auth: AuthPort;
  accounts: AccountAdminPort;
  state: WorkspaceState;
};

function accountResponse(account: AuthenticatedUser) {
  return {
    id: account.id,
    email: account.email,
    status: account.status,
    accountRole: account.accountRole,
    mustChangePassword: account.mustChangePassword,
    directoryActorId: account.directoryActorId,
  };
}

function managedAccountResponse(
  account: Awaited<ReturnType<AccountAdminPort["findById"]>>,
) {
  if (!account) return null;
  return {
    ...accountResponse(account),
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
  };
}

function accountNotFound(req: Request, res: Response): void {
  problem(
    req,
    res,
    404,
    "Not found",
    "Account does not exist.",
    "account_not_found",
  );
}

function canManageAccount(
  caller: AuthenticatedUser,
  target: NonNullable<Awaited<ReturnType<AccountAdminPort["findById"]>>>,
): boolean {
  if (target.accountRole === "ROOT") return false;
  if (caller.accountRole === "ROOT") return true;
  return (
    caller.accountRole === "ACCOUNT_ADMIN" && target.accountRole === "USER"
  );
}

function requireRoot(req: Request, res: Response, next: NextFunction): void {
  if (req.account?.accountRole === "ROOT") {
    next();
    return;
  }
  problem(req, res, 403, "Forbidden", "Root access is required.", "forbidden");
}

function serviceError(req: Request, res: Response, error: unknown): boolean {
  if (error instanceof AccountNotFoundError) {
    accountNotFound(req, res);
    return true;
  }
  if (error instanceof AccountConflictError) {
    problem(
      req,
      res,
      409,
      "Conflict",
      `${error.field} is already linked to an account.`,
      "account_conflict",
    );
    return true;
  }
  return false;
}

export function createAccountAdminRouter(
  options: AccountAdminRouterOptions,
): Router {
  const router = Router();

  router.use(createAccessTokenGuard(options.auth));
  router.use(async (req, res, next) => {
    const account = await options.auth.currentUser(req.principal!);
    if (!account) {
      problem(
        req,
        res,
        401,
        "Unauthorized",
        "The account behind this session is no longer active.",
        "inactive_account",
      );
      return;
    }
    if (account.mustChangePassword) {
      problem(
        req,
        res,
        403,
        "Password change required",
        "Change the temporary password before managing accounts.",
        "password_change_required",
      );
      return;
    }
    if (
      account.accountRole !== "ROOT" &&
      account.accountRole !== "ACCOUNT_ADMIN"
    ) {
      problem(
        req,
        res,
        403,
        "Forbidden",
        "Account administration is not allowed.",
        "forbidden",
      );
      return;
    }
    req.account = account;
    next();
  });

  router.get("/users", async (req, res, next) => {
    try {
      const accounts = await options.accounts.list();
      const data = accounts
        .filter(
          (account) =>
            req.account!.accountRole === "ROOT" ||
            account.accountRole !== "ROOT",
        )
        .map(managedAccountResponse);
      res.json({ data, meta: { total: data.length } });
    } catch (error) {
      next(error);
    }
  });

  router.get("/user-candidates", async (_req, res, next) => {
    try {
      const accounts = await options.accounts.list();
      const linkedActorIds = new Set(
        accounts
          .map((account) => account.directoryActorId)
          .filter((id): id is string => id !== null),
      );
      const data = options.state.people
        .filter((person) => !linkedActorIds.has(person.id))
        .map((person) => ({
          id: person.id,
          name: person.name,
          title: person.title,
          role: person.role,
          departmentId: person.departmentId,
        }));
      res.json({ data, meta: { total: data.length } });
    } catch (error) {
      next(error);
    }
  });

  router.get("/users/:id", async (req, res, next) => {
    try {
      const account = await options.accounts.findById(req.params.id);
      if (!account) {
        accountNotFound(req, res);
        return;
      }
      if (!canManageAccount(req.account!, account)) {
        problem(
          req,
          res,
          403,
          "Forbidden",
          "This account cannot be managed.",
          "forbidden",
        );
        return;
      }
      res.json({ data: managedAccountResponse(account) });
    } catch (error) {
      next(error);
    }
  });

  router.post("/users", async (req, res, next) => {
    const parsed = createManagedAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      problem(
        req,
        res,
        422,
        "Validation failed",
        formatIssues(parsed.error),
        "validation_failed",
      );
      return;
    }
    if (
      !options.state.people.some(
        (person) => person.id === parsed.data.directoryActorId,
      )
    ) {
      problem(
        req,
        res,
        422,
        "Validation failed",
        "directoryActorId does not exist.",
        "invalid_reference",
      );
      return;
    }

    try {
      const account = await options.accounts.create(parsed.data, {
        requestId: req.requestId,
        actorUserId: req.account!.id,
        sessionId: req.principal!.sessionId,
      });
      res.status(201).json({ data: managedAccountResponse(account) });
    } catch (error) {
      if (serviceError(req, res, error)) return;
      next(error);
    }
  });

  router.patch("/users/:id", async (req, res, next) => {
    const parsed = updateManagedAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      problem(
        req,
        res,
        422,
        "Validation failed",
        formatIssues(parsed.error),
        "validation_failed",
      );
      return;
    }
    if (
      parsed.data.directoryActorId &&
      !options.state.people.some(
        (person) => person.id === parsed.data.directoryActorId,
      )
    ) {
      problem(
        req,
        res,
        422,
        "Validation failed",
        "directoryActorId does not exist.",
        "invalid_reference",
      );
      return;
    }

    try {
      const id = req.params.id;
      if (typeof id !== "string") {
        accountNotFound(req, res);
        return;
      }
      const target = await options.accounts.findById(id);
      if (!target) {
        accountNotFound(req, res);
        return;
      }
      if (!canManageAccount(req.account!, target)) {
        problem(
          req,
          res,
          403,
          "Forbidden",
          "This account cannot be managed.",
          "forbidden",
        );
        return;
      }
      const account = await options.accounts.update(id, parsed.data, {
        requestId: req.requestId,
        actorUserId: req.account!.id,
        sessionId: req.principal!.sessionId,
      });
      res.json({ data: managedAccountResponse(account) });
    } catch (error) {
      if (serviceError(req, res, error)) return;
      next(error);
    }
  });

  router.post("/users/:id/reset-password", async (req, res, next) => {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      problem(
        req,
        res,
        422,
        "Validation failed",
        formatIssues(parsed.error),
        "validation_failed",
      );
      return;
    }

    try {
      const target = await options.accounts.findById(req.params.id);
      if (!target) {
        accountNotFound(req, res);
        return;
      }
      if (!canManageAccount(req.account!, target)) {
        problem(
          req,
          res,
          403,
          "Forbidden",
          "This account cannot be managed.",
          "forbidden",
        );
        return;
      }
      const account = await options.accounts.resetPassword(
        req.params.id,
        parsed.data.temporaryPassword,
        {
          requestId: req.requestId,
          actorUserId: req.account!.id,
          sessionId: req.principal!.sessionId,
        },
      );
      res.json({ data: managedAccountResponse(account) });
    } catch (error) {
      if (serviceError(req, res, error)) return;
      next(error);
    }
  });

  router.put("/users/:id/account-role", requireRoot, async (req, res, next) => {
    const parsed = updateAccountRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      problem(
        req,
        res,
        422,
        "Validation failed",
        formatIssues(parsed.error),
        "validation_failed",
      );
      return;
    }

    try {
      const id = req.params.id;
      if (typeof id !== "string") {
        accountNotFound(req, res);
        return;
      }
      const target = await options.accounts.findById(id);
      if (!target) {
        accountNotFound(req, res);
        return;
      }
      if (target.accountRole === "ROOT") {
        problem(
          req,
          res,
          403,
          "Forbidden",
          "The root account cannot be changed.",
          "forbidden",
        );
        return;
      }
      const account = await options.accounts.setAccountRole(
        id,
        parsed.data.accountRole,
        {
          requestId: req.requestId,
          actorUserId: req.account!.id,
          sessionId: req.principal!.sessionId,
        },
      );
      res.json({ data: managedAccountResponse(account) });
    } catch (error) {
      if (serviceError(req, res, error)) return;
      next(error);
    }
  });

  return router;
}
