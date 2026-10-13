import { beforeEach, describe, expect, it } from "vitest";
import { getState, resetWorkspace, setState, setUser } from "@/lib/store";
import { USERS } from "@/lib/mock";
import { taskActions } from "@/lib/tasks";
import { evaluationActions as ev, evaluationTotal } from "@/lib/evaluation";
import {
  calculateCandidate,
  classificationEligibility,
  scoreBand,
} from "@/lib/evaluation-engine";
import { canViewTask } from "@/lib/policy";
import {
  masterActions,
  previewCatalogCsv,
  catalogCsvTemplate,
} from "@/lib/master-data";
import { csvCell, scopedData } from "@/lib/exports";
import { simulateSync } from "@/lib/integration";
const asUser = (id: string) => setUser(USERS.find((u) => u.id === id)!);
beforeEach(() => {
  resetWorkspace();
  asUser("u-leader");
});
async function newWork() {
  await ev.createPeriod({
    name: "Kỳ test",
    kind: "QUARTER",
    startDate: "2026-10-01",
    endDate: "2026-12-31",
  });
  const period = getState().periods[0];
  asUser("u-head");
  expect(
    await taskActions.createTask({
      catalogItemId: getState().catalog.find((c) => c.status === "PUBLISHED")!
        .id,
      assigneeId: "u-staff",
      title: "Nhiệm vụ test",
      description: "Tổng hợp dữ liệu giả",
      dueAt: "2026-12-25",
      periodId: period.id,
      plannedQuantity: 1,
    }),
  ).toBe(true);
  return { period, id: getState().tasks[0].id };
}
async function acceptedWork() {
  const work = await newWork();
  asUser("u-staff");
  await taskActions.saveResult(
    work.id,
    {
      quantity: 1,
      product: "Báo cáo mẫu",
      qualityLevel: "Đáp ứng",
      note: "Synthetic",
      completedAt: "2026-12-20",
    },
    true,
  );
  asUser("u-head");
  await taskActions.acceptTask(work.id);
  return work;
}
describe("candidate engine", () => {
  it.each([
    [49.99, "KHONG_HOAN_THANH"],
    [50, "HOAN_THANH"],
    [69.99, "HOAN_THANH"],
    [70, "TOT"],
    [89.99, "TOT"],
    [90, "XUAT_SAC"],
  ])("band boundary %s", (score, band) =>
    expect(scoreBand(Number(score))).toBe(band),
  );
  it("does not equate a high score with eligibility", () => {
    expect(
      classificationEligibility(
        99,
        [
          {
            id: "discipline",
            label: "x",
            detail: "",
            passed: false,
            blocking: true,
          },
        ],
        "TOT",
      ),
    ).not.toHaveLength(0);
    expect(classificationEligibility(99, [], "XUAT_SAC")).not.toHaveLength(0);
    expect(
      classificationEligibility(99, [], "XUAT_SAC", "NOT_APPLICABLE"),
    ).toEqual([]);
  });
  it("tracks absent inputs and rejects invalid scores", () => {
    expect(calculateCandidate([], 20).missingInputs).toHaveLength(2);
    expect(() => calculateCandidate([], NaN)).toThrow();
    expect(() => calculateCandidate([], 31)).toThrow();
    expect(() => calculateCandidate([], 20, 101)).toThrow();
  });
  it("deterministically computes snapshots and rounds to 2 decimals", async () => {
    const { id } = await acceptedWork();
    const task = getState().tasks.find((t) => t.id === id)!;
    const result = calculateCandidate([task], 27);
    expect(result.calculatedTotal).toBe(92.33);
    expect(result).toEqual(calculateCandidate([task], 27));
    expect(result.taskSnapshots[0].catalogVersion).toBe("v1.1");
  });
});
describe("task policy and transitions", () => {
  it("blocks staff assignment and cross-department head assignment", async () => {
    const base = {
      catalogItemId: "c1",
      assigneeId: "u-staff",
      title: "x",
      description: "",
      dueAt: "2026-12-01",
    };
    asUser("u-staff");
    expect(await taskActions.createTask(base)).toBe(false);
    asUser("u-head");
    expect(
      await taskActions.createTask({ ...base, assigneeId: "p1staff" }),
    ).toBe(false);
    expect(getState().audit[0].outcome).toBe("DENIED");
  });
  it("requires positive numeric planned quantity", async () => {
    const { period } = await newWork();
    expect(
      await taskActions.createTask({
        catalogItemId: "c1",
        assigneeId: "u-staff",
        title: "x",
        description: "",
        dueAt: "2026-12-01",
        periodId: period.id,
        plannedQuantity: NaN,
      }),
    ).toBe(false);
  });
  it("validates transitions, self-review, evidence and optimistic revision", async () => {
    const { id } = await newWork();
    expect(await taskActions.acceptTask(id)).toBe(false);
    asUser("u-staff");
    expect(await taskActions.updateProgress(id, 25)).toBe(true);
    expect(await taskActions.updateProgress(id, 50, "", 0)).toBe(false);
    expect(
      await taskActions.addEvidence(id, {
        name: "real.pdf",
        sizeBytes: 500,
        kind: "PDF",
        classification: "Nội bộ",
        synthetic: false,
      }),
    ).toBe(false);
    expect(
      await taskActions.addEvidence(id, {
        name: "fake.pdf",
        sizeBytes: 500,
        kind: "PDF",
        classification: "Nội bộ",
        synthetic: true,
      }),
    ).toBe(true);
    expect(
      await taskActions.saveResult(
        id,
        { quantity: 1, product: "Báo cáo", qualityLevel: "Đáp ứng", note: "" },
        true,
      ),
    ).toBe(true);
    expect(await taskActions.updateProgress(id, 20)).toBe(false);
    expect(await taskActions.acceptTask(id)).toBe(false);
    asUser("u-head");
    expect(await taskActions.returnTask(id, "Thiếu giải trình")).toBe(true);
    asUser("u-staff");
    expect(
      await taskActions.saveResult(
        id,
        {
          quantity: 1,
          product: "Báo cáo",
          qualityLevel: "Đáp ứng",
          note: "Bổ sung",
        },
        true,
      ),
    ).toBe(true);
    asUser("u-head");
    expect(await taskActions.acceptTask(id)).toBe(true);
  });
  it("retains cancellation history and enforces read scope", async () => {
    const { id } = await newWork();
    expect(await taskActions.cancelTask(id, "Điều chỉnh kế hoạch")).toBe(true);
    expect(getState().tasks[0].status).toBe("CANCELLED");
    asUser("u-staff");
    expect(
      canViewTask(
        getState().user,
        getState().tasks.find((t) => t.departmentId === "d1")!,
      ),
    ).toBe(false);
    expect(
      scopedData(getState()).tasks.every((t) => t.assigneeId === "u-staff"),
    ).toBe(true);
    expect(scopedData(getState()).audit).toEqual([]);
  });
});
describe("evaluation lifecycle", () => {
  it("supports self → review → decide → lock → reopen without losing prior decisions", async () => {
    const { period, id: taskId } = await acceptedWork();
    asUser("u-staff");
    const id = (await ev.createEvaluation({
      periodId: period.id,
      subjectType: "PERSON",
      subjectId: "u-staff",
    }))!;
    expect(await ev.calculateEvaluation(id, { generalScore: 27 })).toBe(true);
    let current = getState().evaluations.find((e) => e.id === id)!;
    expect(evaluationTotal(current)).toBe(92.33);
    expect(
      await ev.updateConditions(
        id,
        current.conditions.map((c) => ({ ...c, passed: true })),
        "Đã kiểm tra dữ liệu giả",
        "NOT_APPLICABLE",
      ),
    ).toBe(true);
    expect(
      await ev.selfEvaluate(id, { comment: "Đã hoàn thành", proposed: "TOT" }),
    ).toBe(true);
    expect(await ev.selfEvaluate(id, { comment: "Lặp", proposed: "TOT" })).toBe(
      false,
    );
    asUser("u-head");
    expect(
      await ev.reviewEvaluation(id, {
        comment: "Đã kiểm tra",
        proposed: "TOT",
        action: "propose",
      }),
    ).toBe(true);
    asUser("u-leader");
    expect(
      await ev.decideEvaluation(id, {
        classification: "TOT",
        note: "Căn cứ mô phỏng",
      }),
    ).toBe(true);
    expect(await ev.lockPeriod(period.id)).toBe(true);
    asUser("u-staff");
    expect(await taskActions.updateProgress(taskId, 25)).toBe(false);
    expect(await ev.calculateEvaluation(id, { generalScore: 20 })).toBe(false);
    asUser("u-leader");
    expect(await ev.reopenPeriod(period.id, "Sửa dữ liệu có lý do")).toBe(true);
    current = getState().evaluations.find((e) => e.id === id)!;
    expect(current.status).toBe("DRAFT");
    expect(current.decision).toBeNull();
    expect(current.decisionHistory).toHaveLength(1);
    expect(current.calculationRuns).toHaveLength(1);
  });
  it("refuses stale calculations after task changes", async () => {
    const { period } = await acceptedWork();
    asUser("u-staff");
    const id = (await ev.createEvaluation({
      periodId: period.id,
      subjectType: "PERSON",
      subjectId: "u-staff",
    }))!;
    await ev.calculateEvaluation(id, { generalScore: 25 });
    asUser("u-head");
    await taskActions.createTask({
      catalogItemId: "c1",
      assigneeId: "u-staff",
      title: "Thêm nhiệm vụ",
      description: "",
      dueAt: "2026-12-25",
      periodId: period.id,
    });
    asUser("u-staff");
    expect(
      await ev.selfEvaluate(id, { comment: "Tự đánh giá", proposed: "TOT" }),
    ).toBe(false);
    expect(getState().audit[0].detail).toContain("đã thay đổi");
  });
  it("keeps collective evaluation distinct and rejects missing D", async () => {
    const { period } = await acceptedWork();
    const id = (await ev.createEvaluation({
      periodId: period.id,
      subjectType: "DEPARTMENT",
      subjectId: "d2",
    }))!;
    expect(await ev.calculateEvaluation(id, { generalScore: 25 })).toBe(false);
    expect(
      await ev.calculateEvaluation(id, {
        generalScore: 25,
        leadershipScore: 90,
      }),
    ).toBe(true);
    expect(getState().evaluations.find((e) => e.id === id)?.subjectType).toBe(
      "DEPARTMENT",
    );
  });
  it("blocks unfinished-period lock and condition structure tampering", async () => {
    const { period } = await acceptedWork();
    asUser("u-staff");
    const id = (await ev.createEvaluation({
      periodId: period.id,
      subjectType: "PERSON",
      subjectId: "u-staff",
    }))!;
    const checks = getState().evaluations.find((e) => e.id === id)!.conditions;
    expect(
      await ev.updateConditions(id, [checks[0], checks[0], checks[0]], "test"),
    ).toBe(false);
    asUser("u-leader");
    expect(await ev.lockPeriod(period.id)).toBe(false);
  });
});
describe("master data and integration", () => {
  it("validates staging rows, duplicate codes and quoted CSV", () => {
    expect(previewCatalogCsv(catalogCsvTemplate, "v-test")[0].errors).toEqual(
      [],
    );
    expect(
      previewCatalogCsv(
        catalogCsvTemplate + catalogCsvTemplate.split("\n")[1] + "\n",
        "v-test",
      )[1].errors,
    ).not.toHaveLength(0);
    expect(() => previewCatalogCsv("wrong,headers\nx,y", "v-test")).toThrow();
  });
  it("publishes a version atomically and preserves old catalog and task snapshots", async () => {
    const { id } = await newWork();
    asUser("u-leader");
    const before = structuredClone(
      getState().tasks.find((t) => t.id === id)!.catalogSnapshot,
    );
    const version = masterActions.duplicateVersion("v1.1", "v2-test");
    const item = getState().catalog.find((c) => c.version === version)!;
    masterActions.saveCatalog({ ...item, name: "Tên phiên bản mới" });
    masterActions.publishVersion(version, "Thử nghiệm công bố");
    expect(getState().activeCatalogVersion).toBe(version);
    expect(() =>
      masterActions.saveCatalog({ ...item, name: "Không được sửa" }),
    ).toThrow();
    expect(getState().tasks.find((t) => t.id === id)!.catalogSnapshot).toEqual(
      before,
    );
  });
  it("blocks deleting referenced people and unauthorized catalog publication", () => {
    expect(() => masterActions.removePerson("u-staff", "x")).toThrow();
    asUser("u-head");
    expect(() => masterActions.publishVersion("v1.0", "x")).toThrow();
  });
  it("neutralizes CSV formulas", () => {
    expect(csvCell('=HYPERLINK("x")')).toBe('"\'=HYPERLINK(""x"")"');
    expect(csvCell("a,b")).toBe('"a,b"');
  });
  it("preserves checkpoint on failure and retries with a linked run", async () => {
    expect(await simulateSync("personnel", "Đối soát mock", true)).toBe(false);
    const failed = getState().integration.runs[0];
    expect(getState().integration.checkpoint).toBe("0");
    expect(
      await simulateSync("personnel", "Đối soát mock", false, failed.id),
    ).toBe(true);
    expect(getState().integration.runs[0].retryOf).toBe(failed.id);
    expect(getState().integration.checkpoint).toBe("1");
    expect(
      await simulateSync("personnel", "Đối soát mock", false, failed.id),
    ).toBe(false);
  });
});
