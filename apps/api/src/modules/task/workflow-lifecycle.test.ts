import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "@/app";
import {
  createWorkspaceState,
  SAMPLE_TASKS,
  SAMPLE_EVALUATIONS,
} from "@/mock-state";
import type { Env } from "@/env";

const testEnv: Env = {
  environment: "development",
  corsOrigins: ["http://localhost:3000"],
  port: 8787,
  publicBaseUrl: "http://localhost:8787",
  problemTypeBase: "http://localhost:8787/problems",
  requestBodyLimit: "1mb",
  databaseUrl: "postgres://mock:mock@localhost:5432/mock",
  jwtAccessSecret: "access-secret-that-is-at-least-32-chars-long",
  jwtAccessIssuer: "btctu:test",
  jwtAccessAudience: "btctu:test",
  jwtAccessTtlSeconds: 900,
  refreshTokenTtlSeconds: 604800,
  cookiePolicy: { secure: false, sameSite: "Lax" },
  auth: {
    loginMaxAttempts: 5,
    loginWindowSeconds: 900,
    rotationGraceSeconds: 15,
  },
};

describe("Workflow Lifecycle & Period Locking", () => {
  it("prevents submitting result when task is already ACCEPTED", async () => {
    const state = createWorkspaceState();
    state.tasks = structuredClone(SAMPLE_TASKS);
    state.tasks[0] = {
      ...state.tasks[0],
      status: "ACCEPTED",
      assigneeId: "p-nguyen-tran-thi",
    };
    const app = createApp(testEnv, { state });

    const res = await request(app)
      .post(`/api/v1/tasks/${state.tasks[0].id}/result`)
      .set("x-dev-user-id", "p-nguyen-tran-thi")
      .send({
        quantity: 2,
        product: "Updated product",
        qualityLevel: "A",
        note: "Trying to overwrite",
        submit: true,
      });

    expect(res.status).toBe(409);
    expect(res.body.type).toContain("invalid_task_status");
  });

  it("prevents accepting task when it is not SUBMITTED", async () => {
    const state = createWorkspaceState();
    state.tasks = structuredClone(SAMPLE_TASKS);
    state.tasks[0] = {
      ...state.tasks[0],
      status: "IN_PROGRESS",
      departmentId: "d4",
    };
    const app = createApp(testEnv, { state });

    const res = await request(app)
      .post(`/api/v1/tasks/${state.tasks[0].id}/accept`)
      .set("x-dev-user-id", "p-nguyen-thuong-hai");

    expect(res.status).toBe(409);
    expect(res.body.type).toContain("invalid_task_status");
  });

  it("prevents mutation on tasks in a locked period", async () => {
    const state = createWorkspaceState();
    state.periods[0].lockedAt = new Date().toISOString();
    state.tasks = structuredClone(SAMPLE_TASKS);
    state.tasks[0] = {
      ...state.tasks[0],
      periodId: state.periods[0].id,
      status: "SUBMITTED",
      assigneeId: "p-nguyen-tran-thi",
    };
    const app = createApp(testEnv, { state });

    const res = await request(app)
      .post(`/api/v1/tasks/${state.tasks[0].id}/accept`)
      .set("x-dev-user-id", "p-nguyen-thuong-hai");

    expect(res.status).toBe(409);
    expect(res.body.type).toContain("period_locked");
  });

  it("prevents self-evaluation when evaluation is not in DRAFT status", async () => {
    const state = createWorkspaceState();
    state.evaluations = structuredClone(SAMPLE_EVALUATIONS);
    state.evaluations[0] = {
      ...state.evaluations[0],
      status: "SUBMITTED",
      subjectId: "p-nguyen-tran-thi",
    };
    const app = createApp(testEnv, { state });

    const res = await request(app)
      .post(`/api/v1/evaluations/${state.evaluations[0].id}/self`)
      .set("x-dev-user-id", "p-nguyen-tran-thi")
      .send({
        comment: "Re-evaluating",
        proposed: "TOT",
      });

    expect(res.status).toBe(409);
    expect(res.body.type).toContain("invalid_evaluation_status");
  });

  it("returns the actors and timestamps recorded for an evaluation workflow", async () => {
    const state = createWorkspaceState();
    state.evaluations = structuredClone(SAMPLE_EVALUATIONS);
    const evaluation = state.evaluations[0];
    evaluation.status = "DRAFT";
    evaluation.selfComment = null;
    evaluation.selfEvaluatedAt = null;
    const app = createApp(testEnv, { state });

    const self = await request(app)
      .post(`/api/v1/evaluations/${evaluation.id}/self`)
      .set("x-dev-user-id", "p-nguyen-tran-thi")
      .send({ comment: "Tự đánh giá", proposed: "TOT" });
    expect(self.status).toBe(200);
    expect(self.body.data.selfEvaluatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    const review = await request(app)
      .post(`/api/v1/evaluations/${evaluation.id}/review`)
      .set("x-dev-user-id", "p-tran-hai-trieu")
      .send({
        comment: "Đề xuất công nhận",
        proposed: "TOT",
        action: "propose",
      });
    expect(review.status).toBe(200);
    expect(review.body.data.reviewerId).toBe("p-tran-hai-trieu");
    expect(review.body.data.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    const decision = await request(app)
      .post(`/api/v1/evaluations/${evaluation.id}/decision`)
      .set("x-dev-user-id", "p-nguyen-thuong-hai")
      .send({ classification: "TOT", note: "Đồng ý" });
    expect(decision.status).toBe(200);
    expect(decision.body.data.decidedById).toBe("p-nguyen-thuong-hai");
    expect(decision.body.data.decidedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("filters audit log by department for department head", async () => {
    const state = createWorkspaceState();
    state.tasks = structuredClone(SAMPLE_TASKS);
    state.audit = [
      {
        id: "a-1",
        requestId: "r-1",
        actorId: "p-tran-hai-trieu",
        action: "accept_task",
        resource: state.tasks[0].id,
        outcome: "SUCCESS",
        detail: "",
        at: new Date().toISOString(),
      },
      {
        id: "a-2",
        requestId: "r-2",
        actorId: "u-other",
        action: "accept_task",
        resource: "NV-OTHER-DEPT",
        outcome: "SUCCESS",
        detail: "",
        at: new Date().toISOString(),
      },
    ];
    const app = createApp(testEnv, { state });

    state.tasks[0].departmentId = "d2";
    const res = await request(app)
      .get("/api/v1/audit")
      .set("x-dev-user-id", "p-tran-hai-trieu");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe("a-1");
  });
  it("rejects creating task with non-existent periodId", async () => {
    const state = createWorkspaceState();
    const app = createApp(testEnv, { state });

    const res = await request(app)
      .post("/api/v1/tasks")
      .set("x-dev-user-id", "p-nguyen-thuong-hai")
      .send({
        catalogItemId: state.catalog[0].id,
        assigneeId: "p-nguyen-tran-thi",
        periodId: "p-non-existent",
        title: "Nhiệm vụ kiểm thử kỳ",
        dueAt: "2026-12-31",
        plannedQuantity: 3,
      });

    expect(res.status).toBe(422);
    expect(res.body.type).toContain("invalid_reference");
  });

  it("requires periodId and plannedQuantity when creating task", async () => {
    const state = createWorkspaceState();
    const app = createApp(testEnv, { state });

    const res = await request(app)
      .post("/api/v1/tasks")
      .set("x-dev-user-id", "p-nguyen-thuong-hai")
      .send({
        catalogItemId: state.catalog[0].id,
        assigneeId: "p-nguyen-tran-thi",
        title: "Nhiệm vụ thiếu dữ liệu kỳ",
        dueAt: "2026-12-31",
      });

    expect(res.status).toBe(422);
    expect(res.body.type).toContain("validation_failed");
    expect(res.body.detail).toContain("periodId");
    expect(res.body.detail).toContain("plannedQuantity");
  });

  it("rejects creating task from an unpublished catalog version", async () => {
    const state = createWorkspaceState();
    const draftCatalog = state.catalog.find((item) => item.version === "v1.0");
    expect(draftCatalog).toBeDefined();
    const app = createApp(testEnv, { state });

    const res = await request(app)
      .post("/api/v1/tasks")
      .set("x-dev-user-id", "p-nguyen-thuong-hai")
      .send({
        catalogItemId: draftCatalog!.id,
        assigneeId: "p-nguyen-tran-thi",
        periodId: state.periods[0].id,
        title: "Nhiệm vụ từ danh mục nháp",
        dueAt: "2026-12-31",
        plannedQuantity: 1,
      });

    expect(res.status).toBe(409);
    expect(res.body.type).toContain("catalog_not_published");
  });

  it("successfully creates task with valid periodId and plannedQuantity", async () => {
    const state = createWorkspaceState();
    const app = createApp(testEnv, { state });

    const res = await request(app)
      .post("/api/v1/tasks")
      .set("x-dev-user-id", "p-nguyen-thuong-hai")
      .send({
        catalogItemId: state.catalog[0].id,
        assigneeId: "p-nguyen-tran-thi",
        periodId: state.periods[0].id,
        title: "Nhiệm vụ kiểm thử hợp lệ",
        dueAt: "2026-12-31",
        plannedQuantity: 4,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.periodId).toBe(state.periods[0].id);
    expect(res.body.data.plannedQuantity).toBe(4);
    expect(res.body.data.title).toBe("Nhiệm vụ kiểm thử hợp lệ");
  });

});
