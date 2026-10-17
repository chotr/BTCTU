import express from "express";
import { openapi } from "@/contract/openapi";
import { createDatabase } from "@/db/client";
import type { Env } from "@/env";
import { errorHandler, notFoundHandler } from "@/middleware/error-handling";
import { createRequestContext } from "@/middleware/request-context";
import { createOriginGuard } from "@/middleware/csrf";
import {
  createAuthModule,
  type AuthModuleOverrides,
} from "@/modules/auth/auth.module";
import { createAuthRouter } from "@/modules/auth/auth.routes";
import { DatabaseAccountAdminStore } from "@/modules/account-admin/account-admin.repository";
import { createAccountAdminRouter } from "@/modules/account-admin/account-admin.routes";
import {
  AccountAdminService,
  type AccountAdminPort,
} from "@/modules/account-admin/account-admin.service";
import { PasswordService } from "@/modules/auth/password.service";
import { createAuditRouter } from "@/modules/audit/audit.routes";
import { createCatalogRouter } from "@/modules/catalog/catalog.routes";
import { createEvaluationRouter } from "@/modules/evaluation/evaluation.routes";
import {
  createDirectoryActorResolver,
  type ActorResolver,
} from "@/modules/identity/actor-resolver";
import { createActorMiddleware } from "@/modules/identity/identity.middleware";
import { createIdentityRouter } from "@/modules/identity/identity.routes";
import { createOrganizationRouter } from "@/modules/organization/organization.routes";
import { createReportingRouter } from "@/modules/reporting/reporting.routes";
import { createTaskRouter } from "@/modules/task/task.routes";
import { createWorkspaceState } from "@/mock-state";
import { configureProblemTypeBase } from "@/shared/problem";
import type { WorkspaceState } from "@/types";

export type AppDependencies = AuthModuleOverrides & {
  actorResolver?: ActorResolver;
  accountAdmin?: AccountAdminPort;
  state?: WorkspaceState;
};

export function createApp(env: Env, dependencies: AppDependencies = {}) {
  const { auth, throttle } = createAuthModule(env, dependencies);
  const state = dependencies.state ?? createWorkspaceState();
  const actorResolver =
    dependencies.actorResolver ?? createDirectoryActorResolver(state.people);
  const accountAdmin =
    dependencies.accountAdmin ??
    new AccountAdminService(
      new DatabaseAccountAdminStore(createDatabase(env.databaseUrl)),
      new PasswordService(),
    );

  const app = express();
  app.disable("x-powered-by");
  configureProblemTypeBase(app, env.problemTypeBase);
  app.use(express.json({ limit: env.requestBodyLimit }));
  app.use(createRequestContext({ allowedOrigins: env.corsOrigins }));

  app.get("/health", (_req, res) =>
    res.json({
      status: "ok",
      service: "btctu-api",
      environment: env.environment,
      now: new Date().toISOString(),
    }),
  );
  app.get("/openapi.json", (_req, res) =>
    res.json({
      ...openapi,
      servers: [{ url: env.publicBaseUrl, description: env.environment }],
    }),
  );

  const api = express.Router();

  api.use(createOriginGuard(env.corsOrigins));

  api.use(
    "/auth",
    createAuthRouter({
      auth,
      throttle,
      allowedOrigins: env.corsOrigins,
      accessTtlSeconds: env.jwtAccessTtlSeconds,
      cookiePolicy: env.cookiePolicy,
      refreshTtlSeconds: env.refreshTokenTtlSeconds,
    }),
  );

  api.use(
    "/admin",
    createAccountAdminRouter({ auth, accounts: accountAdmin, state }),
  );

  api.use(createActorMiddleware({ env, auth, actorResolver, state }));
  api.use(createIdentityRouter(env));
  api.use(createOrganizationRouter());
  api.use(createCatalogRouter());
  api.use(createTaskRouter());
  api.use(createEvaluationRouter());
  api.use(createAuditRouter());
  api.use(createReportingRouter());
  app.use("/api/v1", api);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
