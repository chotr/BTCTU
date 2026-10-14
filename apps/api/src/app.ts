import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { CLASSIFICATIONS } from "@btctu/shared";
import { z, type ZodTypeAny } from "zod";
import {
  createAuthModule,
  type AuthModuleOverrides,
} from "./modules/auth/auth.module";
import { createAuthRouter } from "./modules/auth/auth.routes";
import { accessTokenFromRequest } from "./middleware/authentication";
import { can } from "./middleware/authorization";
import { createOriginGuard } from "./middleware/csrf";
import { createMockState } from "./mock-state";
import {
  MockActorResolver,
  UnprovisionedActorResolver,
  type ActorResolver,
} from "./modules/identity/actor-resolver";
import { ACCESS_COOKIE_NAME } from "./security/cookie";
import { normalizeOrigin } from "./security/origin";
import { formatIssues, problem } from "./shared/problem";
import type { Env } from "./env";
import type { Task } from "./types";

const classificationSchema = z.enum(CLASSIFICATIONS);

const createTaskSchema = z.object({
  catalogItemId: z.string().min(1),
  assigneeId: z.string().min(1),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(2000).default(""),
  dueAt: z.string().trim().min(8).max(32),
});

const resultSchema = z.object({
  quantity: z.number().nonnegative(),
  product: z.string().trim().min(1).max(240),
  qualityLevel: z.enum(["A", "B", "C"]),
  note: z.string().trim().max(2000).default(""),
  submit: z.boolean().default(false),
});

const returnSchema = z.object({ note: z.string().trim().min(1).max(2000) });

const selfEvaluationSchema = z.object({
  comment: z.string().trim().min(1).max(4000),
  proposed: classificationSchema,
});

const reviewSchema = z.object({
  comment: z.string().trim().min(1).max(4000),
  proposed: classificationSchema,
  action: z.enum(["propose", "return"]),
});

const decisionSchema = z.object({
  classification: classificationSchema,
  note: z.string().trim().min(1).max(4000),
});

const openapi = {
  openapi: "3.1.0",
  info: {
    title: "BTCTU Task and Evaluation API",
    version: "0.1.0",
    description:
      "REST contract for task, KPI, evaluation and classification workflows.",
  },
  servers: [{ url: "http://localhost:8787", description: "Local server" }],
  security: [{ developmentIdentity: [] }],
  components: {
    securitySchemes: {
      developmentIdentity: {
        type: "apiKey",
        in: "header",
        name: "x-dev-user-id",
        description: "Local-development identity adapter",
      },
      accessJwt: {
        type: "http",
        scheme: "bearer",
        description:
          "Bearer header or the httpOnly cookie issued by /api/v1/auth/login",
      },
    },
  },
  paths: {
    "/api/v1/auth/login": {
      post: {
        security: [],
        responses: {
          "200": {
            description: "Account returned, both tokens set as httpOnly cookies",
          },
          "401": { description: "Invalid credentials" },
          "403": { description: "Account disabled" },
          "429": { description: "Too many failed attempts" },
        },
      },
    },
    "/api/v1/auth/refresh": {
      post: {
        security: [],
        responses: {
          "200": { description: "Tokens rotated inside the same session" },
          "401": {
            description: "Refresh token missing, invalid, expired or reused",
          },
          "409": {
            description: "A refresh with the same token is already in progress",
          },
        },
      },
    },
    "/api/v1/auth/logout": {
      post: {
        security: [],
        responses: {
          "204": { description: "Session revoked and both cookies cleared" },
        },
      },
    },
    "/api/v1/auth/session": {
      get: {
        security: [{ accessJwt: [] }],
        responses: {
          "200": { description: "Authenticated account" },
          "401": { description: "Missing, invalid or expired access token" },
        },
      },
    },
    "/health": {
      get: {
        security: [],
        responses: { "200": { description: "Server is ready" } },
      },
    },
    "/api/v1/me": {
      get: { responses: { "200": { description: "Current actor" } } },
    },
    "/api/v1/organizations": {
      get: { responses: { "200": { description: "Departments and people" } } },
    },
    "/api/v1/catalog": {
      get: { responses: { "200": { description: "Versioned work catalog" } } },
    },
    "/api/v1/tasks": {
      get: { responses: { "200": { description: "Task list" } } },
      post: { responses: { "201": { description: "Task created" } } },
    },
    "/api/v1/tasks/{id}": {
      get: {
        responses: {
          "200": { description: "Task detail" },
          "404": { description: "Not found" },
        },
      },
    },
    "/api/v1/tasks/{id}/result": {
      post: { responses: { "200": { description: "Result saved" } } },
    },
    "/api/v1/tasks/{id}/accept": {
      post: { responses: { "200": { description: "Task accepted" } } },
    },
    "/api/v1/tasks/{id}/return": {
      post: { responses: { "200": { description: "Task returned" } } },
    },
    "/api/v1/evaluations": {
      get: { responses: { "200": { description: "Evaluation list" } } },
    },
    "/api/v1/evaluations/{id}": {
      get: { responses: { "200": { description: "Evaluation detail" } } },
    },
    "/api/v1/evaluations/{id}/self": {
      post: {
        responses: { "200": { description: "Self evaluation submitted" } },
      },
    },
    "/api/v1/evaluations/{id}/review": {
      post: { responses: { "200": { description: "Review saved" } } },
    },
    "/api/v1/evaluations/{id}/decision": {
      post: { responses: { "200": { description: "Decision saved" } } },
    },
    "/api/v1/periods/{id}/lock": {
      post: { responses: { "200": { description: "Period locked" } } },
    },
    "/api/v1/audit": {
      get: { responses: { "200": { description: "Audit events" } } },
    },
    "/api/v1/reports/summary": {
      get: { responses: { "200": { description: "Dashboard summary" } } },
    },
  },
} as const;

function validate(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const detail = formatIssues(result.error);
      problem(req, res, 422, "Validation failed", detail, "validation_failed");
      return;
    }
    req.validated = result.data;
    next();
  };
}

function query(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

function addAudit(
  req: Request,
  action: string,
  resource: string,
  outcome: "OK" | "DENIED",
  detail = "",
) {
  const state = req.state!;
  const actor = req.actor!;
  state.audit.unshift({
    id: `aud-${crypto.randomUUID()}`,
    requestId: req.requestId,
    actorId: actor.id,
    action,
    resource,
    outcome,
    detail,
    at: new Date().toISOString(),
  });
}

function denied(
  req: Request,
  res: Response,
  action: string,
  resource: string,
  detail: string,
) {
  addAudit(req, action, resource, "DENIED", detail);
  return problem(req, res, 403, "Forbidden", detail, "forbidden");
}

function nextTaskId(): string {
  return `NV-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function nextStatusForTask(task: Task, submit: boolean): Task["status"] {
  if (submit) return "SUBMITTED";
  return task.status === "ASSIGNED" ? "IN_PROGRESS" : task.status;
}

export type AppDependencies = AuthModuleOverrides & {
  actorResolver?: ActorResolver;
};

export function createApp(env: Env, dependencies: AppDependencies = {}) {
  const { auth, throttle } = createAuthModule(env, dependencies);
  const actorResolver =
    dependencies.actorResolver ??
    (env.environment === "production"
      ? new UnprovisionedActorResolver()
      : new MockActorResolver(createMockState().people));
  const allowedOrigins = new Set(env.corsOrigins.map(normalizeOrigin));
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: env.requestBodyLimit }));

  app.use((req, res, next) => {
    const requestId = req.header("x-request-id") ?? crypto.randomUUID();
    req.requestId = requestId;
    res.setHeader("x-request-id", requestId);
    res.setHeader("x-content-type-options", "nosniff");
    res.setHeader("referrer-policy", "no-referrer");

    const origin = req.header("origin");
    if (origin && allowedOrigins.has(normalizeOrigin(origin))) {
      res.setHeader("access-control-allow-origin", origin);
      res.setHeader("access-control-allow-credentials", "true");
      res.setHeader("vary", "Origin");
    }
    res.setHeader(
      "access-control-allow-headers",
      "content-type, x-dev-user-id, x-request-id, authorization",
    );
    res.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  });

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

  // Tokens travel in cookies, so every writing request carries an origin check.
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

  api.use(async (req, res, next) => {
    const state = createMockState();
    req.state = state;

    let userId: string;

    if (env.environment === "production") {
      const token = accessTokenFromRequest(req, ACCESS_COOKIE_NAME);
      if (!token) {
        problem(
          req,
          res,
          401,
          "Unauthorized",
          "An access token is required.",
          "missing_access_token",
        );
        return;
      }

      try {
        req.principal = await auth.authenticate(token);
      } catch {
        problem(
          req,
          res,
          401,
          "Unauthorized",
          "The access token is invalid or expired.",
          "invalid_access_token",
        );
        return;
      }

      const user = await auth.currentUser(req.principal);
      if (!user) {
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

      userId = user.id;
    } else {
      const header = req.header("x-dev-user-id");
      if (!header) {
        problem(
          req,
          res,
          401,
          "Unauthorized",
          "A development identity header is required.",
          "unknown_actor",
        );
        return;
      }

      userId = header;
    }

    const actor = await actorResolver.resolve(userId);
    if (!actor) {
      if (env.environment === "production") {
        problem(
          req,
          res,
          403,
          "Forbidden",
          "This account is not linked to a person in the directory.",
          "actor_not_provisioned",
        );
      } else {
        problem(
          req,
          res,
          401,
          "Unauthorized",
          "Unknown or missing actor identity.",
          "unknown_actor",
        );
      }
      return;
    }

    req.actor = actor;
    next();
  });

  api.get("/me", (req, res) =>
    res.json({
      data: req.actor,
      meta: {
        identityMode:
          env.environment === "production"
            ? "access-token"
            : "development-header",
      },
    }),
  );

  api.get("/organizations", (req, res) =>
    res.json({
      data: {
        departments: req.state!.departments,
        people: req.state!.people,
      },
      meta: { sourceClass: "FACT", sourceRef: "QĐ01, Điều 2–7" },
    }),
  );

  api.get("/catalog", (req, res) =>
    res.json({
      data: req.state!.catalog,
      meta: {
        publishedVersion: "v1.1",
        draftVersion: "v1.0",
        sourceNote:
          "Excel rows remain operational/master-data draft until approved.",
      },
    }),
  );

  api.get("/tasks", (req, res) => {
    const status = query(req, "status");
    const departmentId = query(req, "departmentId");
    const q = query(req, "q")?.toLowerCase();
    const data = req.state!.tasks.filter(
      (task) =>
        (!status || task.status === status) &&
        (!departmentId || task.departmentId === departmentId) &&
        (!q || `${task.id} ${task.title}`.toLowerCase().includes(q)),
    );
    return res.json({ data, meta: { total: data.length } });
  });

  api.post("/tasks", validate(createTaskSchema), (req, res) => {
    const state = req.state!;
    const actor = req.actor!;
    const input = req.validated as z.infer<typeof createTaskSchema>;
    const assignee = state.people.find(
      (person) => person.id === input.assigneeId,
    );
    const catalog = state.catalog.find(
      (item) => item.id === input.catalogItemId,
    );
    if (!assignee || !catalog) {
      problem(
        req,
        res,
        422,
        "Validation failed",
        "assigneeId or catalogItemId does not exist.",
        "invalid_reference",
      );
      return;
    }
    if (
      !can(actor, {
        action: "task.create",
        resource: { departmentId: assignee.departmentId },
      })
    ) {
      denied(
        req,
        res,
        "create_task",
        input.title,
        "Actor cannot assign work in this department.",
      );
      return;
    }

    const task: Task = {
      id: nextTaskId(),
      title: input.title,
      description: input.description,
      catalogItemId: input.catalogItemId,
      departmentId: assignee.departmentId,
      assigneeId: assignee.id,
      assignerId: actor.id,
      dueAt: input.dueAt,
      status: "ASSIGNED",
      progress: 0,
      result: null,
    };
    state.tasks.unshift(task);
    addAudit(req, "create_task", task.id, "OK", `Assigned to ${assignee.name}`);
    res.status(201).json({ data: task });
  });

  api.get("/tasks/:id", (req, res) => {
    const task = req.state!.tasks.find(
      (candidate) => candidate.id === req.params.id,
    );
    if (!task) {
      problem(
        req,
        res,
        404,
        "Not found",
        "Task does not exist.",
        "task_not_found",
      );
      return;
    }
    res.json({ data: task });
  });

  api.post("/tasks/:id/result", validate(resultSchema), (req, res) => {
    const actor = req.actor!;
    const task = req.state!.tasks.find(
      (candidate) => candidate.id === req.params.id,
    );
    if (!task) {
      problem(
        req,
        res,
        404,
        "Not found",
        "Task does not exist.",
        "task_not_found",
      );
      return;
    }
    if (actor.id !== task.assigneeId) {
      denied(
        req,
        res,
        "save_task_result",
        task.id,
        "Only the assignee can save a result.",
      );
      return;
    }
    const input = req.validated as z.infer<typeof resultSchema>;
    task.result = {
      quantity: input.quantity,
      product: input.product,
      qualityLevel: input.qualityLevel,
      note: input.note,
      submittedAt: input.submit ? new Date().toISOString() : null,
    };
    task.progress = input.submit ? 100 : Math.max(task.progress, 1);
    task.status = nextStatusForTask(task, input.submit);
    addAudit(
      req,
      input.submit ? "submit_task_result" : "save_task_result",
      task.id,
      "OK",
    );
    res.json({ data: task });
  });

  api.post("/tasks/:id/accept", (req, res) => {
    const actor = req.actor!;
    const task = req.state!.tasks.find(
      (candidate) => candidate.id === req.params.id,
    );
    if (!task) {
      problem(
        req,
        res,
        404,
        "Not found",
        "Task does not exist.",
        "task_not_found",
      );
      return;
    }
    if (
      !can(actor, {
        action: "task.accept",
        resource: { departmentId: task.departmentId },
      })
    ) {
      denied(
        req,
        res,
        "accept_task",
        task.id,
        "Actor cannot review this department.",
      );
      return;
    }
    task.status = "ACCEPTED";
    addAudit(req, "accept_task", task.id, "OK");
    res.json({ data: task });
  });

  api.post("/tasks/:id/return", validate(returnSchema), (req, res) => {
    const actor = req.actor!;
    const task = req.state!.tasks.find(
      (candidate) => candidate.id === req.params.id,
    );
    if (!task) {
      problem(
        req,
        res,
        404,
        "Not found",
        "Task does not exist.",
        "task_not_found",
      );
      return;
    }
    if (
      !can(actor, {
        action: "task.return",
        resource: { departmentId: task.departmentId },
      })
    ) {
      denied(
        req,
        res,
        "return_task",
        task.id,
        "Actor cannot review this department.",
      );
      return;
    }
    const input = req.validated as z.infer<typeof returnSchema>;
    task.status = "RETURNED";
    addAudit(req, "return_task", task.id, "OK", input.note);
    res.json({ data: task });
  });

  api.get("/evaluations", (req, res) => {
    const periodId = query(req, "periodId");
    const status = query(req, "status");
    const data = req.state!.evaluations.filter(
      (evaluation) =>
        (!periodId || evaluation.periodId === periodId) &&
        (!status || evaluation.status === status),
    );
    res.json({ data, meta: { total: data.length } });
  });

  api.get("/evaluations/:id", (req, res) => {
    const evaluation = req.state!.evaluations.find(
      (candidate) => candidate.id === req.params.id,
    );
    if (!evaluation) {
      problem(
        req,
        res,
        404,
        "Not found",
        "Evaluation does not exist.",
        "evaluation_not_found",
      );
      return;
    }
    res.json({
      data: evaluation,
      meta: {
        formulaNote:
          "05-HD/TU has a worked-example arithmetic inconsistency; the configured rule remains subject to approval.",
      },
    });
  });

  api.post(
    "/evaluations/:id/self",
    validate(selfEvaluationSchema),
    (req, res) => {
      const actor = req.actor!;
      const evaluation = req.state!.evaluations.find(
        (candidate) => candidate.id === req.params.id,
      );
      if (!evaluation) {
        problem(
          req,
          res,
          404,
          "Not found",
          "Evaluation does not exist.",
          "evaluation_not_found",
        );
        return;
      }
      if (
        !can(actor, {
          action: "evaluation.self",
          resource: { subjectId: evaluation.subjectId },
        })
      ) {
        denied(
          req,
          res,
          "self_evaluate",
          evaluation.id,
          "Only the evaluation subject can submit self-evaluation.",
        );
        return;
      }
      const input = req.validated as z.infer<typeof selfEvaluationSchema>;
      evaluation.status = "SUBMITTED";
      evaluation.selfComment = input.comment;
      evaluation.classification = input.proposed;
      addAudit(req, "self_evaluate", evaluation.id, "OK");
      res.json({ data: evaluation });
    },
  );

  api.post("/evaluations/:id/review", validate(reviewSchema), (req, res) => {
    const actor = req.actor!;
    const evaluation = req.state!.evaluations.find(
      (candidate) => candidate.id === req.params.id,
    );
    if (!evaluation) {
      problem(
        req,
        res,
        404,
        "Not found",
        "Evaluation does not exist.",
        "evaluation_not_found",
      );
      return;
    }
    if (
      !can(actor, {
        action: "evaluation.review",
        resource: { departmentId: evaluation.departmentId },
      })
    ) {
      denied(
        req,
        res,
        "review_evaluation",
        evaluation.id,
        "Actor cannot review this department.",
      );
      return;
    }
    const input = req.validated as z.infer<typeof reviewSchema>;
    evaluation.status = input.action === "propose" ? "REVIEWED" : "DRAFT";
    evaluation.reviewComment = input.comment;
    evaluation.classification = input.proposed;
    addAudit(
      req,
      input.action === "propose" ? "review_evaluation" : "return_evaluation",
      evaluation.id,
      "OK",
      input.comment,
    );
    res.json({ data: evaluation });
  });

  api.post(
    "/evaluations/:id/decision",
    validate(decisionSchema),
    (req, res) => {
      const actor = req.actor!;
      const evaluation = req.state!.evaluations.find(
        (candidate) => candidate.id === req.params.id,
      );
      if (!evaluation) {
        problem(
          req,
          res,
          404,
          "Not found",
          "Evaluation does not exist.",
          "evaluation_not_found",
        );
        return;
      }
      if (!can(actor, { action: "evaluation.decide" })) {
        denied(
          req,
          res,
          "decide_evaluation",
          evaluation.id,
          "Only the competent authority can decide.",
        );
        return;
      }
      const input = req.validated as z.infer<typeof decisionSchema>;
      evaluation.status = "APPROVED";
      evaluation.classification = input.classification;
      evaluation.decisionNote = input.note;
      addAudit(req, "decide_evaluation", evaluation.id, "OK", input.note);
      res.json({ data: evaluation });
    },
  );

  api.post("/periods/:id/lock", (req, res) => {
    const actor = req.actor!;
    const state = req.state!;
    const period = state.periods.find(
      (candidate) => candidate.id === req.params.id,
    );
    if (!period) {
      problem(
        req,
        res,
        404,
        "Not found",
        "Period does not exist.",
        "period_not_found",
      );
      return;
    }
      if (!can(actor, { action: "period.lock" })) {
      denied(
        req,
        res,
        "lock_period",
        period.id,
        "Only the competent authority can lock a period.",
      );
      return;
    }
    period.lockedAt = new Date().toISOString();
    for (const evaluation of state.evaluations.filter(
      (candidate) =>
        candidate.periodId === period.id && candidate.status === "APPROVED",
    )) {
      evaluation.status = "LOCKED";
    }
    addAudit(req, "lock_period", period.id, "OK");
    res.json({ data: period });
  });

  api.get("/audit", (req, res) => {
    if (!can(req.actor!, { action: "audit.read" })) {
      denied(
        req,
        res,
        "view_audit",
        "audit",
        "Staff cannot view the audit stream.",
      );
      return;
    }
    const outcome = query(req, "outcome");
    const data = req.state!.audit.filter(
      (event) => !outcome || event.outcome === outcome,
    );
    res.json({ data, meta: { total: data.length } });
  });

  api.get("/reports/summary", (req, res) => {
    const state = req.state!;
    const tasksByStatus = Object.fromEntries(
      [...new Set(state.tasks.map((task) => task.status))].map((status) => [
        status,
        state.tasks.filter((task) => task.status === status).length,
      ]),
    );
    const evaluationsByClassification = Object.fromEntries(
      [
        ...new Set(
          state.evaluations.map((evaluation) => evaluation.classification),
        ),
      ].map((classification) => [
        classification,
        state.evaluations.filter(
          (evaluation) => evaluation.classification === classification,
        ).length,
      ]),
    );
    res.json({
      data: {
        period: state.periods[0],
        tasksByStatus,
        evaluationsByClassification,
        averageScore: state.evaluations.length
          ? Number(
              (
                state.evaluations.reduce(
                  (sum, evaluation) => sum + evaluation.score,
                  0,
                ) / state.evaluations.length
              ).toFixed(2),
            )
          : 0,
      },
      meta: {
        sourceClass: "INFERENCE",
        note: "Aggregation rules require approval before official reporting.",
      },
    });
  });

  app.use("/api/v1", api);

  app.use((req, res) =>
    problem(
      req,
      res,
      404,
      "Not found",
      "Route does not exist.",
      "route_not_found",
    ),
  );

  app.use(
    (
      error: Error & { status?: number; body?: unknown },
      req: Request,
      res: Response,
      _next: NextFunction,
    ) => {
      if (
        error instanceof SyntaxError &&
        error.status === 400 &&
        "body" in error
      ) {
        problem(
          req,
          res,
          400,
          "Bad request",
          "Request body is not valid JSON.",
          "invalid_json",
        );
        return;
      }
      console.error(
        JSON.stringify({
          requestId: req.requestId,
          path: req.path,
          error: error.message,
        }),
      );
      problem(
        req,
        res,
        500,
        "Internal server error",
        "The server could not complete the request.",
        "internal_error",
      );
    },
  );

  return app;
}
