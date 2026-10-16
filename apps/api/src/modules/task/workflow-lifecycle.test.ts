import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "@/app";
import { createWorkspaceState } from "@/mock-state";
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
    state.tasks[0] = {
      ...state.tasks[0],
      status: "ACCEPTED",
      assigneeId: "u-staff",
    };
    const app = createApp(testEnv, { state });

    const res = await request(app)
      .post(`/api/v1/tasks/${state.tasks[0].id}/result`)
      .set("x-dev-user-id", "u-staff")
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
    state.tasks[0] = {
      ...state.tasks[0],
      status: "IN_PROGRESS",
      departmentId: "d4",
    };
    const app = createApp(testEnv, { state });

    const res = await request(app)
      .post(`/api/v1/tasks/${state.tasks[0].id}/accept`)
      .set("x-dev-user-id", "u-leader");

    expect(res.status).toBe(409);
    expect(res.body.type).toContain("invalid_task_status");
  });

  it("prevents mutation on tasks in a locked period", async () => {
    const state = createWorkspaceState();
    state.periods[0].lockedAt = new Date().toISOString();
    state.tasks[0] = {
      ...state.tasks[0],
      periodId: state.periods[0].id,
      status: "SUBMITTED",
      assigneeId: "u-staff",
    };
    const app = createApp(testEnv, { state });

    const res = await request(app)
      .post(`/api/v1/tasks/${state.tasks[0].id}/accept`)
      .set("x-dev-user-id", "u-leader");

    expect(res.status).toBe(409);
    expect(res.body.type).toContain("period_locked");
  });

  it("prevents self-evaluation when evaluation is not in DRAFT status", async () => {
    const state = createWorkspaceState();
    state.evaluations[0] = {
      ...state.evaluations[0],
      status: "SUBMITTED",
      subjectId: "u-staff",
    };
    const app = createApp(testEnv, { state });

    const res = await request(app)
      .post(`/api/v1/evaluations/${state.evaluations[0].id}/self`)
      .set("x-dev-user-id", "u-staff")
      .send({
        comment: "Re-evaluating",
        proposed: "TOT",
      });

    expect(res.status).toBe(409);
    expect(res.body.type).toContain("invalid_evaluation_status");
  });

  it("filters audit log by department for department head", async () => {
    const state = createWorkspaceState();
    state.audit = [
      {
        id: "a-1",
        requestId: "r-1",
        actorId: "u-head",
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

    // u-head is head of d4
    state.tasks[0].departmentId = "d4";
    const res = await request(app)
      .get("/api/v1/audit")
      .set("x-dev-user-id", "u-head");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe("a-1");
  });
  it("rejects creating task with non-existent periodId", async () => {
    const state = createWorkspaceState();
    const app = createApp(testEnv, { state });

    const res = await request(app)
      .post("/api/v1/tasks")
      .set("x-dev-user-id", "u-leader")
      .send({
        catalogItemId: state.catalog[0].id,
        assigneeId: "u-staff",
        periodId: "p-non-existent",
        title: "Nhiệm vụ kiểm thử kỳ",
        dueAt: "2026-12-31",
        plannedQuantity: 3,
      });

    expect(res.status).toBe(422);
    expect(res.body.type).toContain("invalid_reference");
  });

  it("successfully creates task with valid periodId and plannedQuantity", async () => {
    const state = createWorkspaceState();
    const app = createApp(testEnv, { state });

    const res = await request(app)
      .post("/api/v1/tasks")
      .set("x-dev-user-id", "u-leader")
      .send({
        catalogItemId: state.catalog[0].id,
        assigneeId: "u-staff",
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
