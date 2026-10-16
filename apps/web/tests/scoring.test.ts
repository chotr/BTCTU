import { describe, expect, it } from "vitest";
import { calculateScore, roundScore } from "@/lib/domain/scoring";
import type { Task } from "@/lib/types";

describe("Scoring Engine (HD05)", () => {
  const baseTask: Task = {
    id: "NV-01",
    title: "Nhiệm vụ 1",
    description: "",
    catalogItemId: "cat-1",
    departmentId: "dept-1",
    assigneeId: "u-1",
    assignerId: "u-head",
    positionRefId: "pos-1",
    period: "Q3/2026",
    dueAt: "2026-10-31",
    status: "ACCEPTED",
    progress: 100,
    plannedQuantity: 2,
    result: {
      quantity: 2,
      unit: "báo cáo",
      product: "Báo cáo",
      qualityLevel: "Đáp ứng tốt",
      note: "",
      submittedAt: "2026-10-20T00:00:00.000Z",
    },
    evidence: [],
    history: [],
  };

  it("calculates ABC axes for staff", () => {
    const res = calculateScore([baseTask], 28);
    expect(res.ruleVersion).toBe("HD05-ABC");
    expect(res.generalScore).toBe(28);
    expect(res.missingInputs).toHaveLength(0);

    const axisA = res.axes.find((a) => a.code === "A");
    const axisB = res.axes.find((a) => a.code === "B");
    const axisC = res.axes.find((a) => a.code === "C");

    expect(axisA?.value).toBe(100);
    expect(axisB?.value).toBe(100);
    expect(axisC?.value).toBe(100);
    expect(res.calculatedTotal).toBe(28 + 100 * 0.7);
  });

  it("includes axis D for leadership", () => {
    const res = calculateScore([baseTask], 28, 90);
    expect(res.ruleVersion).toBe("HD05-ABCD");
    const axisD = res.axes.find((a) => a.code === "D");
    expect(axisD?.value).toBe(90);

    const avg = (100 + 100 + 100 + 90) / 4;
    expect(res.calculatedTotal).toBe(roundScore(28 + avg * 0.7));
  });

  it("flags missing plannedQuantity", () => {
    const taskWithoutPlan: Task = {
      ...baseTask,
      plannedQuantity: 0,
    };
    const res = calculateScore([taskWithoutPlan], 25);
    expect(res.missingInputs).toContain(
      "NV-01: thiếu số lượng kế hoạch hợp lệ.",
    );
  });

  it("flags late tasks in axis C", () => {
    const lateTask: Task = {
      ...baseTask,
      result: {
        ...baseTask.result!,
        submittedAt: "2026-11-05T00:00:00.000Z",
      },
    };
    const res = calculateScore([lateTask], 25);
    const axisC = res.axes.find((a) => a.code === "C");
    expect(axisC?.value).toBe(0);
  });
});
