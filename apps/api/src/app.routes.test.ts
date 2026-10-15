import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app";
import { createTestEnv } from "./env.test-helpers";

const app = createApp(createTestEnv());

const leader = { "x-dev-user-id": "u-leader" };
const head = { "x-dev-user-id": "u-head" };
const staff = { "x-dev-user-id": "u-staff" };

describe("identity và request context", () => {
  it("từ chối khi thiếu danh tính phát triển", async () => {
    const response = await request(app).get("/api/v1/organizations");

    expect(response.status).toBe(401);
    expect(response.body.type).toContain("unknown_actor");
  });

  it("trả actor và chế độ danh tính đang dùng", async () => {
    const response = await request(app).get("/api/v1/me").set(leader);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      id: "u-leader",
      role: "lanh_dao",
    });
    expect(response.body.meta.identityMode).toBe("development-header");
  });

  it("gắn request id và header bảo mật cho mọi phản hồi", async () => {
    const response = await request(app).get("/health");

    expect(response.headers["x-request-id"]).toBeTruthy();
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["referrer-policy"]).toBe("no-referrer");
  });

  it("giữ request id do client gửi khi nó hợp lệ", async () => {
    const response = await request(app)
      .get("/health")
      .set("x-request-id", "corr-123");

    expect(response.headers["x-request-id"]).toBe("corr-123");
  });

  it("thay request id không an toàn bằng UUID do server sinh", async () => {
    const unsafe = await request(app)
      .get("/health")
      .set("x-request-id", "bad id");
    const tooLong = await request(app)
      .get("/health")
      .set("x-request-id", "x".repeat(129));
    const uuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

    expect(unsafe.headers["x-request-id"]).toMatch(uuid);
    expect(tooLong.headers["x-request-id"]).toMatch(uuid);
  });

  it("chỉ trả CORS cho origin nằm trong danh sách cho phép", async () => {
    const allowed = await request(app)
      .get("/api/v1/me")
      .set(leader)
      .set("origin", "http://localhost:3000");
    const blocked = await request(app)
      .get("/api/v1/me")
      .set(leader)
      .set("origin", "http://evil.test");

    expect(allowed.headers["access-control-allow-origin"]).toBe(
      "http://localhost:3000",
    );
    expect(blocked.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("trả lời preflight", async () => {
    const response = await request(app)
      .options("/api/v1/tasks")
      .set("origin", "http://localhost:3000");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-methods"]).toBe(
      "GET,POST,OPTIONS",
    );
  });
});

describe("organization và catalog", () => {
  it("trả đơn vị và nhân sự kèm nguồn", async () => {
    const response = await request(app)
      .get("/api/v1/organizations")
      .set(leader);

    expect(response.status).toBe(200);
    expect(response.body.data.departments).toHaveLength(4);
    expect(response.body.data.people).toHaveLength(3);
    expect(response.body.meta.sourceClass).toBe("FACT");
  });

  it("trả danh mục công việc kèm phiên bản", async () => {
    const response = await request(app).get("/api/v1/catalog").set(leader);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(3);
    expect(response.body.meta.publishedVersion).toBe("v1.1");
  });
});

describe("task", () => {
  it("lọc danh sách theo trạng thái, đơn vị và từ khoá", async () => {
    const byStatus = await request(app)
      .get("/api/v1/tasks?status=SUBMITTED")
      .set(leader);
    const byDepartment = await request(app)
      .get("/api/v1/tasks?departmentId=d2")
      .set(leader);
    const byKeyword = await request(app)
      .get("/api/v1/tasks?q=nhân%20sự")
      .set(leader);
    const all = await request(app).get("/api/v1/tasks").set(leader);

    expect(byStatus.body.meta.total).toBe(1);
    expect(byStatus.body.data[0].id).toBe("NV-2401");
    expect(byDepartment.body.meta.total).toBe(1);
    expect(byDepartment.body.data[0].id).toBe("NV-2402");
    expect(byKeyword.body.meta.total).toBe(1);
    expect(byKeyword.body.data[0].id).toBe("NV-2401");
    expect(all.body.meta.total).toBe(2);
  });

  it("trả chi tiết nhiệm vụ và 404 khi không có", async () => {
    const found = await request(app).get("/api/v1/tasks/NV-2401").set(leader);
    const missing = await request(app).get("/api/v1/tasks/NV-9999").set(leader);

    expect(found.status).toBe(200);
    expect(found.body.data.title).toContain("báo cáo nhân sự");
    expect(missing.status).toBe(404);
    expect(missing.body.type).toContain("task_not_found");
  });

  it("tạo nhiệm vụ trong đơn vị mà người giao có thẩm quyền", async () => {
    const response = await request(app).post("/api/v1/tasks").set(head).send({
      catalogItemId: "cat-01",
      assigneeId: "u-staff",
      title: "Soạn đề cương báo cáo",
      description: "Bản nháp trình trưởng phòng.",
      dueAt: "2026-10-30",
    });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      catalogItemId: "cat-01",
      departmentId: "d2",
      assigneeId: "u-staff",
      assignerId: "u-head",
      status: "ASSIGNED",
      progress: 0,
      result: null,
    });
    expect(response.body.data.id).toMatch(/^NV-/);
  });

  it("từ chối tạo nhiệm vụ khi body sai contract", async () => {
    const response = await request(app).post("/api/v1/tasks").set(head).send({
      catalogItemId: "cat-01",
      assigneeId: "u-staff",
      title: "ab",
      dueAt: "2026-10-30",
    });

    expect(response.status).toBe(422);
    expect(response.body.type).toContain("validation_failed");
    expect(response.body.detail).toContain("title");
  });

  it("từ chối khi tham chiếu không tồn tại", async () => {
    const response = await request(app).post("/api/v1/tasks").set(head).send({
      catalogItemId: "cat-01",
      assigneeId: "u-missing",
      title: "Soạn đề cương báo cáo",
      dueAt: "2026-10-30",
    });

    expect(response.status).toBe(422);
    expect(response.body.type).toContain("invalid_reference");
  });

  it("từ chối tạo nhiệm vụ khi thiếu thẩm quyền", async () => {
    const response = await request(app).post("/api/v1/tasks").set(staff).send({
      catalogItemId: "cat-01",
      assigneeId: "u-staff",
      title: "Soạn đề cương báo cáo",
      dueAt: "2026-10-30",
    });

    expect(response.status).toBe(403);
    expect(response.body.type).toContain("forbidden");
  });

  it("chỉ người được giao mới ghi được kết quả", async () => {
    const saved = await request(app)
      .post("/api/v1/tasks/NV-2402/result")
      .set(staff)
      .send({
        quantity: 2,
        product: "Bao-cao-Q3.docx",
        qualityLevel: "A",
        note: "Đã bổ sung phụ lục.",
        submit: false,
      });
    const submitted = await request(app)
      .post("/api/v1/tasks/NV-2402/result")
      .set(staff)
      .send({
        quantity: 2,
        product: "Bao-cao-Q3.docx",
        qualityLevel: "A",
        submit: true,
      });
    const foreign = await request(app)
      .post("/api/v1/tasks/NV-2402/result")
      .set(leader)
      .send({
        quantity: 1,
        product: "x.docx",
        qualityLevel: "B",
        submit: true,
      });

    expect(saved.status).toBe(200);
    expect(saved.body.data.status).toBe("IN_PROGRESS");
    expect(saved.body.data.progress).toBe(60);
    expect(saved.body.data.result.submittedAt).toBeNull();
    expect(submitted.body.data.status).toBe("SUBMITTED");
    expect(submitted.body.data.progress).toBe(100);
    expect(submitted.body.data.result.submittedAt).not.toBeNull();
    expect(foreign.status).toBe(403);
  });

  it("nghiệm thu nhiệm vụ theo thẩm quyền", async () => {
    const accepted = await request(app)
      .post("/api/v1/tasks/NV-2401/accept")
      .set(leader);
    const denied = await request(app)
      .post("/api/v1/tasks/NV-2401/accept")
      .set(head);

    expect(accepted.status).toBe(200);
    expect(accepted.body.data.status).toBe("ACCEPTED");
    expect(denied.status).toBe(403);
  });

  it("trả lại nhiệm vụ kèm lý do", async () => {
    const returned = await request(app)
      .post("/api/v1/tasks/NV-2402/return")
      .set(head)
      .send({ note: "Thiếu minh chứng." });
    const missingNote = await request(app)
      .post("/api/v1/tasks/NV-2402/return")
      .set(head)
      .send({});

    expect(returned.status).toBe(200);
    expect(returned.body.data.status).toBe("RETURNED");
    expect(missingNote.status).toBe(422);
  });
});

describe("evaluation và kỳ đánh giá", () => {
  it("lọc danh sách đánh giá", async () => {
    const all = await request(app).get("/api/v1/evaluations").set(leader);
    const byStatus = await request(app)
      .get("/api/v1/evaluations?status=SUBMITTED")
      .set(leader);
    const byPeriod = await request(app)
      .get("/api/v1/evaluations?periodId=p-q3-2026")
      .set(leader);

    expect(all.body.meta.total).toBe(2);
    expect(byStatus.body.meta.total).toBe(1);
    expect(byPeriod.body.meta.total).toBe(2);
  });

  it("trả chi tiết đánh giá kèm ghi chú công thức và 404 khi không có", async () => {
    const found = await request(app)
      .get("/api/v1/evaluations/ev-u-staff-q3")
      .set(leader);
    const missing = await request(app)
      .get("/api/v1/evaluations/ev-unknown")
      .set(leader);

    expect(found.status).toBe(200);
    expect(found.body.meta.formulaNote).toContain("05-HD/TU");
    expect(missing.status).toBe(404);
    expect(missing.body.type).toContain("evaluation_not_found");
  });

  it("chỉ đối tượng được đánh giá mới tự đánh giá được", async () => {
    const done = await request(app)
      .post("/api/v1/evaluations/ev-u-staff-q3/self")
      .set(staff)
      .send({ comment: "Hoàn thành các nhiệm vụ.", proposed: "TOT" });
    const denied = await request(app)
      .post("/api/v1/evaluations/ev-u-staff-q3/self")
      .set(head)
      .send({ comment: "Không phải đối tượng.", proposed: "TOT" });

    expect(done.status).toBe(200);
    expect(done.body.data).toMatchObject({
      status: "SUBMITTED",
      selfComment: "Hoàn thành các nhiệm vụ.",
      classification: "TOT",
    });
    expect(denied.status).toBe(403);
  });

  it("thẩm định đề xuất hoặc trả lại hồ sơ", async () => {
    const proposed = await request(app)
      .post("/api/v1/evaluations/ev-u-staff-q3/review")
      .set(head)
      .send({ comment: "Đủ căn cứ.", proposed: "XUAT_SAC", action: "propose" });
    const returned = await request(app)
      .post("/api/v1/evaluations/ev-u-staff-q3/review")
      .set(head)
      .send({
        comment: "Bổ sung minh chứng.",
        proposed: "TOT",
        action: "return",
      });

    expect(proposed.status).toBe(200);
    expect(proposed.body.data.status).toBe("REVIEWED");
    expect(proposed.body.data.classification).toBe("XUAT_SAC");
    expect(proposed.body.data.reviewComment).toBe("Đủ căn cứ.");
    expect(returned.body.data.status).toBe("DRAFT");
  });

  it("chỉ cấp có thẩm quyền mới ra quyết định", async () => {
    const decided = await request(app)
      .post("/api/v1/evaluations/ev-u-staff-q3/decision")
      .set(leader)
      .send({ classification: "TOT", note: "Thống nhất đề xuất." });
    const denied = await request(app)
      .post("/api/v1/evaluations/ev-u-staff-q3/decision")
      .set(head)
      .send({ classification: "TOT", note: "Không có thẩm quyền." });

    expect(decided.status).toBe(200);
    expect(decided.body.data).toMatchObject({
      status: "APPROVED",
      classification: "TOT",
      decisionNote: "Thống nhất đề xuất.",
    });
    expect(denied.status).toBe(403);
  });

  it("khoá kỳ đánh giá theo thẩm quyền", async () => {
    const locked = await request(app)
      .post("/api/v1/periods/p-q3-2026/lock")
      .set(leader);
    const denied = await request(app)
      .post("/api/v1/periods/p-q3-2026/lock")
      .set(head);
    const missing = await request(app)
      .post("/api/v1/periods/p-unknown/lock")
      .set(leader);

    expect(locked.status).toBe(200);
    expect(locked.body.data.id).toBe("p-q3-2026");
    expect(locked.body.data.lockedAt).not.toBeNull();
    expect(denied.status).toBe(403);
    expect(missing.status).toBe(404);
    expect(missing.body.type).toContain("period_not_found");
  });
});

describe("audit và báo cáo", () => {
  it("chỉ vai trò được phép đọc vết audit", async () => {
    const allowed = await request(app).get("/api/v1/audit").set(leader);
    const denied = await request(app).get("/api/v1/audit").set(staff);
    const filtered = await request(app)
      .get("/api/v1/audit?outcome=DENIED")
      .set(leader);

    expect(allowed.status).toBe(200);
    expect(allowed.body.meta.total).toBe(0);
    expect(denied.status).toBe(403);
    expect(denied.body.type).toContain("forbidden");
    expect(filtered.status).toBe(200);
  });

  it("tổng hợp dashboard", async () => {
    const response = await request(app)
      .get("/api/v1/reports/summary")
      .set(leader);

    expect(response.status).toBe(200);
    expect(response.body.data.tasksByStatus).toEqual({
      SUBMITTED: 1,
      IN_PROGRESS: 1,
    });
    expect(response.body.data.evaluationsByClassification).toEqual({
      TOT: 1,
      XUAT_SAC: 1,
    });
    expect(response.body.data.averageScore).toBe(86.75);
    expect(response.body.meta.sourceClass).toBe("INFERENCE");
  });
});

describe("contract và xử lý lỗi biên", () => {
  it("dựng không gian tên type từ địa chỉ công khai của cấu hình", async () => {
    const response = await request(app).get("/api/v1/me");

    expect(response.body.type).toBe(
      "http://localhost:3000/problems/unknown_actor",
    );
  });

  it("cho phép đặt không gian tên type riêng", async () => {
    const customApp = createApp(
      createTestEnv({ problemTypeBase: "https://docs.btctu.vn/problems" }),
    );
    const response = await request(customApp).get("/api/v1/me");

    expect(response.body.type).toBe(
      "https://docs.btctu.vn/problems/unknown_actor",
    );
  });

  it("phục vụ OpenAPI theo cấu hình đang chạy", async () => {
    const response = await request(app).get("/openapi.json");

    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe("3.1.0");
    expect(response.body.servers[0].url).toBe("http://localhost:3000");
    expect(Object.keys(response.body.paths)).toContain("/api/v1/tasks");
  });

  it("trả health kèm môi trường", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: "ok",
      service: "btctu-api",
      environment: "test",
    });
  });

  it("trả 404 problem+json cho route không tồn tại", async () => {
    const response = await request(app)
      .get("/api/v1/khong-ton-tai")
      .set(leader);

    expect(response.status).toBe(404);
    expect(response.body.type).toContain("route_not_found");
  });

  it("trả 400 khi body không phải JSON hợp lệ", async () => {
    const response = await request(app)
      .post("/api/v1/tasks")
      .set(head)
      .set("content-type", "application/json")
      .send("{");

    expect(response.status).toBe(400);
    expect(response.body.type).toContain("invalid_json");
  });

  it("chặn request đổi trạng thái từ origin khác", async () => {
    const response = await request(app)
      .post("/api/v1/tasks/NV-2401/accept")
      .set(leader)
      .set("origin", "http://evil.test");

    expect(response.status).toBe(403);
    expect(response.body.type).toContain("origin_not_allowed");
  });
});
