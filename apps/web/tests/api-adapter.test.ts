import { describe, expect, it } from "vitest";
import {
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
        reviewComment: "Đủ căn cứ đề xuất.",
        decisionNote: null,
      },
      {
        people: [
          {
            id: "u-staff",
            name: "Lê Quốc Bảo",
            title: "Chuyên viên",
            departmentId: "d2",
            positionRefId: "pos-staff",
          },
        ],
      },
      "2026-10-16T00:00:00.000Z",
    );

    expect(evaluation.generalScore).toBe(86.75);
    expect(evaluation.calc.arithmeticTotal).toBe(86.75);
    expect(evaluation.self?.comment).toBe("Đã hoàn thành nhiệm vụ.");
    expect(evaluation.review?.comment).toBe("Đủ căn cứ đề xuất.");
    expect(evaluation.review?.reviewerId).toBe("");
    expect(evaluation.conditions[0].passed).toBe(true);
  });
});
