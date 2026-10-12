import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { z } from "zod";
import { createMockState } from "./mock-state";
import type { Actor, Classification, MockState, Evaluation, Role, Task } from "./types";

type Variables = {
  actor: Actor;
  requestId: string;
  state: MockState;
};

type AppEnv = { Bindings: Env; Variables: Variables };
type AppContext = Context<AppEnv>;

const app = new Hono<AppEnv>();

const classificationSchema = z.enum(["XUAT_SAC", "TOT", "HOAN_THANH", "KHONG_HOAN_THANH"]);

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
    description: "REST contract for task, KPI, evaluation and classification workflows.",
  },
  servers: [{ url: "http://localhost:8787", description: "Local Worker" }],
  security: [{ developmentIdentity: [] }],
  components: {
    securitySchemes: {
      developmentIdentity: { type: "apiKey", in: "header", name: "x-dev-user-id", description: "Local-development identity adapter" },
      accessJwt: { type: "http", scheme: "bearer", description: "Production uses Cloudflare Access JWT verification" },
    },
  },
  paths: {
    "/health": { get: { security: [], responses: { "200": { description: "Worker is ready" } } } },
    "/api/v1/me": { get: { responses: { "200": { description: "Current actor" } } } },
    "/api/v1/organizations": { get: { responses: { "200": { description: "Departments and people" } } } },
    "/api/v1/catalog": { get: { responses: { "200": { description: "Versioned work catalog" } } } },
    "/api/v1/tasks": { get: { responses: { "200": { description: "Task list" } } }, post: { responses: { "201": { description: "Task created" } } } },
    "/api/v1/tasks/{id}": { get: { responses: { "200": { description: "Task detail" }, "404": { description: "Not found" } } } },
    "/api/v1/tasks/{id}/result": { post: { responses: { "200": { description: "Result saved" } } } },
    "/api/v1/tasks/{id}/accept": { post: { responses: { "200": { description: "Task accepted" } } } },
    "/api/v1/tasks/{id}/return": { post: { responses: { "200": { description: "Task returned" } } } },
    "/api/v1/evaluations": { get: { responses: { "200": { description: "Evaluation list" } } } },
    "/api/v1/evaluations/{id}": { get: { responses: { "200": { description: "Evaluation detail" } } } },
    "/api/v1/evaluations/{id}/self": { post: { responses: { "200": { description: "Self evaluation submitted" } } } },
    "/api/v1/evaluations/{id}/review": { post: { responses: { "200": { description: "Review saved" } } } },
    "/api/v1/evaluations/{id}/decision": { post: { responses: { "200": { description: "Decision saved" } } } },
    "/api/v1/periods/{id}/lock": { post: { responses: { "200": { description: "Period locked" } } } },
    "/api/v1/audit": { get: { responses: { "200": { description: "Audit events" } } } },
    "/api/v1/reports/summary": { get: { responses: { "200": { description: "Dashboard summary" } } } },
  },
} as const;

function problem(c: AppContext, status: ContentfulStatusCode, title: string, detail: string, code: string) {
  return c.json(
    {
      type: `https://btctu.local/problems/${code}`,
      title,
      status,
      detail,
      instance: c.req.path,
      requestId: c.get("requestId"),
    },
    status,
  );
}

function actorFromHeader(id: string | undefined, state: MockState): Actor | null {
  const person = state.people.find((candidate) => candidate.id === id);
  if (!person) return null;
  return { id: person.id, name: person.name, role: person.role, departmentId: person.departmentId };
}

function canAssign(actor: Actor, assigneeDepartmentId: string): boolean {
  return actor.role === "lanh_dao" || (actor.role === "truong_phong" && actor.departmentId === assigneeDepartmentId);
}

function canReviewDepartment(actor: Actor, departmentId: string): boolean {
  return actor.role === "lanh_dao" || (actor.role === "truong_phong" && actor.departmentId === departmentId);
}

function canDecide(actor: Actor): boolean {
  return actor.role === "lanh_dao";
}

function addAudit(c: AppContext, action: string, resource: string, outcome: "OK" | "DENIED", detail = "") {
  const state = c.get("state");
  const actor = c.get("actor");
  state.audit.unshift({
    id: `aud-${crypto.randomUUID()}`,
    requestId: c.get("requestId"),
    actorId: actor.id,
    action,
    resource,
    outcome,
    detail,
    at: new Date().toISOString(),
  });
}

function denied(c: AppContext, action: string, resource: string, detail: string) {
  addAudit(c, action, resource, "DENIED", detail);
  return problem(c, 403, "Forbidden", detail, "forbidden");
}

function nextTaskId(): string {
  return `NV-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function nextStatusForTask(task: Task, submit: boolean): Task["status"] {
  if (submit) return "SUBMITTED";
  return task.status === "ASSIGNED" ? "IN_PROGRESS" : task.status;
}

function classificationForScore(score: number): Classification {
  if (score >= 90) return "XUAT_SAC";
  if (score >= 70) return "TOT";
  if (score >= 50) return "HOAN_THANH";
  return "KHONG_HOAN_THANH";
}

app.use("*", async (c, next) => {
  const requestId = c.req.header("x-request-id") ?? crypto.randomUUID();
  c.set("requestId", requestId);
  c.header("x-request-id", requestId);
  c.header("x-content-type-options", "nosniff");
  c.header("referrer-policy", "no-referrer");

  const origin = c.req.header("origin");
  if (origin && origin === (c.env.CORS_ORIGIN ?? "http://localhost:3000")) {
    c.header("access-control-allow-origin", origin);
    c.header("vary", "Origin");
  }
  c.header("access-control-allow-headers", "content-type, x-dev-user-id, x-request-id, authorization");
  c.header("access-control-allow-methods", "GET,POST,OPTIONS");
  if (c.req.method === "OPTIONS") return c.body(null, 204);

  await next();
});

app.use("/api/v1/*", async (c, next) => {
  const state = createMockState();
  c.set("state", state);

  if (c.env.ENVIRONMENT === "production" && !c.req.header("cf-access-jwt-assertion")) {
    return problem(c, 401, "Unauthorized", "Production API requires a Cloudflare Access JWT.", "missing_access_identity");
  }

  const actor = actorFromHeader(c.req.header("x-dev-user-id") ?? (c.env.ENVIRONMENT === "production" ? undefined : "u-leader"), state);
  if (!actor) return problem(c, 401, "Unauthorized", "Unknown or missing actor identity.", "unknown_actor");
  c.set("actor", actor);
  await next();
});

app.get("/health", (c) => c.json({ status: "ok", service: "btctu-api", environment: c.env.ENVIRONMENT, now: new Date().toISOString() }));
app.get("/openapi.json", (c) => c.json(openapi));

app.get("/api/v1/me", (c) => c.json({ data: c.get("actor"), meta: { identityMode: c.env.ENVIRONMENT === "production" ? "cloudflare-access" : "development-header" } }));

app.get("/api/v1/organizations", (c) => {
  const state = c.get("state");
  return c.json({ data: { departments: state.departments, people: state.people }, meta: { sourceClass: "FACT", sourceRef: "QĐ01, Điều 2–7" } });
});

app.get("/api/v1/catalog", (c) => c.json({ data: c.get("state").catalog, meta: { publishedVersion: "v1.1", draftVersion: "v1.0", sourceNote: "Excel rows remain operational/master-data draft until approved." } }));

app.get("/api/v1/tasks", (c) => {
  const state = c.get("state");
  const status = c.req.query("status");
  const departmentId = c.req.query("departmentId");
  const q = c.req.query("q")?.toLowerCase();
  const data = state.tasks.filter((task) => (!status || task.status === status) && (!departmentId || task.departmentId === departmentId) && (!q || `${task.id} ${task.title}`.toLowerCase().includes(q)));
  return c.json({ data, meta: { total: data.length } });
});

app.post("/api/v1/tasks", zValidator("json", createTaskSchema), (c) => {
  const state = c.get("state");
  const actor = c.get("actor");
  const input = c.req.valid("json");
  const assignee = state.people.find((person) => person.id === input.assigneeId);
  const catalog = state.catalog.find((item) => item.id === input.catalogItemId);
  if (!assignee || !catalog) return problem(c, 422, "Validation failed", "assigneeId or catalogItemId does not exist.", "invalid_reference");
  if (!canAssign(actor, assignee.departmentId)) return denied(c, "create_task", input.title, "Actor cannot assign work in this department.");

  const task: Task = {
    id: nextTaskId(), title: input.title, description: input.description, catalogItemId: input.catalogItemId,
    departmentId: assignee.departmentId, assigneeId: assignee.id, assignerId: actor.id, dueAt: input.dueAt,
    status: "ASSIGNED", progress: 0, result: null,
  };
  state.tasks.unshift(task);
  addAudit(c, "create_task", task.id, "OK", `Assigned to ${assignee.name}`);
  return c.json({ data: task }, 201);
});

app.get("/api/v1/tasks/:id", (c) => {
  const task = c.get("state").tasks.find((candidate) => candidate.id === c.req.param("id"));
  return task ? c.json({ data: task }) : problem(c, 404, "Not found", "Task does not exist.", "task_not_found");
});

app.post("/api/v1/tasks/:id/result", zValidator("json", resultSchema), (c) => {
  const state = c.get("state");
  const actor = c.get("actor");
  const task = state.tasks.find((candidate) => candidate.id === c.req.param("id"));
  if (!task) return problem(c, 404, "Not found", "Task does not exist.", "task_not_found");
  if (actor.id !== task.assigneeId) return denied(c, "save_task_result", task.id, "Only the assignee can save a result.");
  const input = c.req.valid("json");
  task.result = { quantity: input.quantity, product: input.product, qualityLevel: input.qualityLevel, note: input.note, submittedAt: input.submit ? new Date().toISOString() : null };
  task.progress = input.submit ? 100 : Math.max(task.progress, 1);
  task.status = nextStatusForTask(task, input.submit);
  addAudit(c, input.submit ? "submit_task_result" : "save_task_result", task.id, "OK");
  return c.json({ data: task });
});

app.post("/api/v1/tasks/:id/accept", (c) => {
  const state = c.get("state");
  const actor = c.get("actor");
  const task = state.tasks.find((candidate) => candidate.id === c.req.param("id"));
  if (!task) return problem(c, 404, "Not found", "Task does not exist.", "task_not_found");
  if (!canReviewDepartment(actor, task.departmentId)) return denied(c, "accept_task", task.id, "Actor cannot review this department.");
  task.status = "ACCEPTED";
  addAudit(c, "accept_task", task.id, "OK");
  return c.json({ data: task });
});

app.post("/api/v1/tasks/:id/return", zValidator("json", returnSchema), (c) => {
  const state = c.get("state");
  const actor = c.get("actor");
  const task = state.tasks.find((candidate) => candidate.id === c.req.param("id"));
  if (!task) return problem(c, 404, "Not found", "Task does not exist.", "task_not_found");
  if (!canReviewDepartment(actor, task.departmentId)) return denied(c, "return_task", task.id, "Actor cannot review this department.");
  task.status = "RETURNED";
  addAudit(c, "return_task", task.id, "OK", c.req.valid("json").note);
  return c.json({ data: task });
});

app.get("/api/v1/evaluations", (c) => {
  const state = c.get("state");
  const periodId = c.req.query("periodId");
  const status = c.req.query("status");
  const data = state.evaluations.filter((evaluation) => (!periodId || evaluation.periodId === periodId) && (!status || evaluation.status === status));
  return c.json({ data, meta: { total: data.length } });
});

app.get("/api/v1/evaluations/:id", (c) => {
  const evaluation = c.get("state").evaluations.find((candidate) => candidate.id === c.req.param("id"));
  return evaluation ? c.json({ data: evaluation, meta: { formulaNote: "05-HD/TU has a worked-example arithmetic inconsistency; the configured rule remains subject to approval." } }) : problem(c, 404, "Not found", "Evaluation does not exist.", "evaluation_not_found");
});

app.post("/api/v1/evaluations/:id/self", zValidator("json", selfEvaluationSchema), (c) => {
  const state = c.get("state");
  const actor = c.get("actor");
  const evaluation = state.evaluations.find((candidate) => candidate.id === c.req.param("id"));
  if (!evaluation) return problem(c, 404, "Not found", "Evaluation does not exist.", "evaluation_not_found");
  if (evaluation.subjectId !== actor.id) return denied(c, "self_evaluate", evaluation.id, "Only the evaluation subject can submit self-evaluation.");
  const input = c.req.valid("json");
  evaluation.status = "SUBMITTED";
  evaluation.selfComment = input.comment;
  evaluation.classification = input.proposed;
  addAudit(c, "self_evaluate", evaluation.id, "OK");
  return c.json({ data: evaluation });
});

app.post("/api/v1/evaluations/:id/review", zValidator("json", reviewSchema), (c) => {
  const state = c.get("state");
  const actor = c.get("actor");
  const evaluation = state.evaluations.find((candidate) => candidate.id === c.req.param("id"));
  if (!evaluation) return problem(c, 404, "Not found", "Evaluation does not exist.", "evaluation_not_found");
  if (!canReviewDepartment(actor, evaluation.departmentId)) return denied(c, "review_evaluation", evaluation.id, "Actor cannot review this department.");
  const input = c.req.valid("json");
  evaluation.status = input.action === "propose" ? "REVIEWED" : "DRAFT";
  evaluation.reviewComment = input.comment;
  evaluation.classification = input.proposed;
  addAudit(c, input.action === "propose" ? "review_evaluation" : "return_evaluation", evaluation.id, "OK", input.comment);
  return c.json({ data: evaluation });
});

app.post("/api/v1/evaluations/:id/decision", zValidator("json", decisionSchema), (c) => {
  const state = c.get("state");
  const actor = c.get("actor");
  const evaluation = state.evaluations.find((candidate) => candidate.id === c.req.param("id"));
  if (!evaluation) return problem(c, 404, "Not found", "Evaluation does not exist.", "evaluation_not_found");
  if (!canDecide(actor)) return denied(c, "decide_evaluation", evaluation.id, "Only the competent authority can decide.");
  const input = c.req.valid("json");
  evaluation.status = "APPROVED";
  evaluation.classification = input.classification;
  evaluation.decisionNote = input.note;
  addAudit(c, "decide_evaluation", evaluation.id, "OK", input.note);
  return c.json({ data: evaluation });
});

app.post("/api/v1/periods/:id/lock", (c) => {
  const state = c.get("state");
  const actor = c.get("actor");
  const period = state.periods.find((candidate) => candidate.id === c.req.param("id"));
  if (!period) return problem(c, 404, "Not found", "Period does not exist.", "period_not_found");
  if (!canDecide(actor)) return denied(c, "lock_period", period.id, "Only the competent authority can lock a period.");
  period.lockedAt = new Date().toISOString();
  for (const evaluation of state.evaluations.filter((candidate) => candidate.periodId === period.id && candidate.status === "APPROVED")) evaluation.status = "LOCKED";
  addAudit(c, "lock_period", period.id, "OK");
  return c.json({ data: period });
});

app.get("/api/v1/audit", (c) => {
  const state = c.get("state");
  if (c.get("actor").role === "cong_chuc") return denied(c, "view_audit", "audit", "Staff cannot view the audit stream.");
  const outcome = c.req.query("outcome");
  const data = state.audit.filter((event) => !outcome || event.outcome === outcome);
  return c.json({ data, meta: { total: data.length } });
});

app.get("/api/v1/reports/summary", (c) => {
  const state = c.get("state");
  const tasksByStatus = Object.fromEntries([...new Set(state.tasks.map((task) => task.status))].map((status) => [status, state.tasks.filter((task) => task.status === status).length]));
  const evaluationsByClassification = Object.fromEntries([...new Set(state.evaluations.map((evaluation) => evaluation.classification))].map((classification) => [classification, state.evaluations.filter((evaluation) => evaluation.classification === classification).length]));
  return c.json({ data: { period: state.periods[0], tasksByStatus, evaluationsByClassification, averageScore: state.evaluations.length ? Number((state.evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) / state.evaluations.length).toFixed(2)) : 0 }, meta: { sourceClass: "INFERENCE", note: "Aggregation rules require approval before official reporting." } });
});

app.notFound((c) => problem(c, 404, "Not found", "Route does not exist.", "route_not_found"));

app.onError((error, c) => {
  console.error(JSON.stringify({ requestId: c.get("requestId"), path: c.req.path, error: error.message }));
  return problem(c, 500, "Internal server error", "The Worker could not complete the request.", "internal_error");
});

export default app;
