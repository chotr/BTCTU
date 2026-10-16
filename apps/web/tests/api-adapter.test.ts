import { describe, expect, it } from "vitest";
import {
  apiModeActions,
  mapApiCatalogItem,
  mapApiEvaluation,
  mapApiPeriod,
  mapApiTask,
} from "@/lib/api-adapter";

describe("API adapter", () => {
  it("maps catalog and period records to the fields used by the UI", () => {
    expect(
      mapApiCatalogItem(
        {
          id: "cat-01",
          version: "v1.1",
          title: "Tổng hợp báo cáo",
          departmentId: "d2",
          standardScore: 20,
          coefficient: 1.2,
          durationDays: 10,
          sourceRef: "05-HD/TU",
        },
        "v1.1",
      ),
    ).toMatchObject({
      code: "CAT-01",
      name: "Tổng hợp báo cáo",
      complexity: "Cao",
      status: "PUBLISHED",
    });

    expect(
      mapApiPeriod({
        id: "p-q3-2026",
        label: "Quý III/2026",
        lockedAt: null,
      }),
    ).toEqual({
      id: "p-q3-2026",
      name: "Quý III/2026",
      range: "Quý III/2026",
      status: "ACTIVE",
      lockedAt: null,
    });
  });

  it("maps task quality and fills required display context", () => {
    const catalog = mapApiCatalogItem(
      {
        id: "cat-01",
        version: "v1.1",
        title: "Tổng hợp báo cáo",
        departmentId: "d2",
        standardScore: 20,
        coefficient: 1,
        durationDays: 10,
        sourceRef: "05-HD/TU",
      },
      "v1.1",
    );
    const task = mapApiTask(
      {
        id: "NV-01",
        title: "Báo cáo quý",
        description: "Tổng hợp số liệu",
        catalogItemId: "cat-01",
        departmentId: "d2",
        assigneeId: "u-staff",
        assignerId: "u-head",
        periodId: "p-q3-2026",
        plannedQuantity: 2,
        dueAt: "2026-10-31",
        status: "SUBMITTED",
        progress: 100,
        result: {
          quantity: 1,
          product: "Báo cáo quý",
          qualityLevel: "A",
          note: "Đã nộp",
          submittedAt: "2026-10-15T08:00:00.000Z",
        },
      },
      {
        catalog: [catalog],
        departments: [
          {
            id: "d2",
            code: "TCCB",
            name: "Phòng Tổ chức cán bộ",
            shortName: "TCCB",
            functionText: "",
            headId: "u-head",
            responsibilityIds: [],
          },
        ],
        people: [
          {
            id: "u-staff",
            name: "Lê Quốc Bảo",
            title: "Chuyên viên",
            departmentId: "d2",
            positionRefId: "pos-staff",
          },
        ],
        periods: [
          {
            id: "p-q3-2026",
            name: "Quý III/2026",
            range: "Quý III/2026",
            status: "ACTIVE",
            lockedAt: null,
          },
        ],
      },
    );

    expect(task.periodId).toBe("p-q3-2026");
    expect(task.plannedQuantity).toBe(2);
    expect(task.positionRefId).toBe("pos-staff");
    expect(task.result?.qualityLevel).toBe("Đáp ứng tốt");
    expect(task.evidence).toEqual([]);
  });

  it("keeps the API score and workflow comments in an evaluation", () => {
    const evaluation = mapApiEvaluation(
      {
        id: "ev-01",
        periodId: "p-q3-2026",
        subjectId: "u-staff",
        departmentId: "d2",
        status: "REVIEWED",
        score: 86.75,
        classification: "TOT",
        blockerCount: 0,
        selfComment: "Đã hoàn thành nhiệm vụ.",
        selfEvaluatedAt: "2026-10-14T08:00:00.000Z",
        reviewComment: "Đủ căn cứ đề xuất.",
        reviewerId: "u-head",
        reviewedAt: "2026-10-15T08:00:00.000Z",
        decisionNote: null,
        decidedById: null,
        decidedAt: null,
      },
      {
        people: [
          {
            id: "u-staff",
            name: "Lê Quốc Bảo",
            title: "Chuyên viên",
            role: "cong_chuc",
            departmentId: "d2",
            positionRefId: "pos-staff",
          },
        ],
      },
    );

    expect(evaluation.generalScore).toBe(86.75);
    expect(evaluation.calc.arithmeticTotal).toBe(86.75);
    expect(evaluation.self?.comment).toBe("Đã hoàn thành nhiệm vụ.");
    expect(evaluation.review?.comment).toBe("Đủ căn cứ đề xuất.");
    expect(evaluation.self?.at).toBe("2026-10-14T08:00:00.000Z");
    expect(evaluation.review?.reviewerId).toBe("u-head");
    expect(evaluation.review?.at).toBe("2026-10-15T08:00:00.000Z");
    expect(evaluation.conditions[0].passed).toBe(true);
  });
  it("serializes full CreateTaskInput payload including periodId and plannedQuantity", async () => {
    let capturedBody = "";
    const originalFetch = global.fetch;
    global.fetch = async (_url, init) => {
      capturedBody = init?.body as string;
      return {
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          data: {
            id: "NV-NEW",
            title: "Task with period",
            description: "Desc",
            catalogItemId: "cat-01",
            departmentId: "d2",
            assigneeId: "u-staff",
            assignerId: "u-head",
            periodId: "p-q3-2026",
            plannedQuantity: 5,
            dueAt: "2026-10-31",
            status: "ASSIGNED",
            progress: 0,
            result: null,
          },
        }),
      } as unknown as Response;
    };

    try {
      const success = await apiModeActions.createTask({
        catalogItemId: "cat-01",
        assigneeId: "u-staff",
        periodId: "p-q3-2026",
        plannedQuantity: 5,
        title: "Task with period",
        description: "Desc",
        dueAt: "2026-10-31",
      });

      expect(success).toBe(true);
      const parsed = JSON.parse(capturedBody);
      expect(parsed.periodId).toBe("p-q3-2026");
      expect(parsed.plannedQuantity).toBe(5);
      expect(parsed.catalogItemId).toBe("cat-01");
    } finally {
      global.fetch = originalFetch;
    }
  });

});
