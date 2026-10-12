import type {
  AxisSnapshot,
  CalculationRun,
  Task,
} from "@/lib/types";

/** Candidate rule version identifier shown in snapshots/UI. */
export const CANDIDATE_RULE = "BTCTU-CANDIDATE-2026.1";

export const roundScore = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * Candidate interpretation only: the source does not prescribe these per-task
 * weights. Pure function — no state, no side effects.
 */
export function calculateCandidate(
  tasks: Task[],
  generalScore: number,
  leadershipScore?: number,
): Omit<CalculationRun, "id" | "at" | "actorId" | "reason" | "override"> {
  if (!Number.isFinite(generalScore) || generalScore < 0 || generalScore > 30)
    throw new Error("Điểm chung phải từ 0 đến 30.");
  if (
    leadershipScore !== undefined &&
    (!Number.isFinite(leadershipScore) ||
      leadershipScore < 0 ||
      leadershipScore > 100)
  )
    throw new Error("Điểm điều hành phải từ 0 đến 100.");
  const missingInputs: string[] = [];
  const snapshots = tasks.map((task) => {
    const extended = task as Task & {
      plannedQuantity?: number;
      catalogSnapshot?: { version?: string };
    };
    return {
      id: task.id,
      title: task.title,
      status: task.status,
      quantity: task.result?.quantity ?? 0,
      plannedQuantity: extended.plannedQuantity ?? 1,
      quality: task.result?.qualityLevel ?? "",
      submittedAt:
        (task.result as Task["result"] & { completedAt?: string })
          ?.completedAt ||
        task.result?.submittedAt ||
        "",
      dueAt: task.dueAt,
      catalogVersion: extended.catalogSnapshot?.version ?? "fixture/synthetic",
    };
  });
  const accepted = snapshots.filter(
    (task) => task.status === "ACCEPTED" || task.status === "LOCKED",
  );
  if (!tasks.length)
    missingInputs.push("Chưa có nhiệm vụ trong kỳ; không đủ căn cứ tính KPI.");
  if (!accepted.length)
    missingInputs.push(
      "Chưa có kết quả được nghiệm thu; các trục công việc đang bằng 0.",
    );
  const qualityMap: Record<string, number> = {
    "Vượt yêu cầu": 100,
    "Đáp ứng tốt": 100,
    "Đáp ứng": 80,
    "Cần cải thiện": 50,
    "Cần chỉnh sửa": 50,
    "Cần hoàn thiện": 50,
    "Không đạt": 0,
    "Không đáp ứng": 0,
  };
  let quantity = 0,
    quality = 0,
    timely = 0;
  for (const task of accepted) {
    if (!(task.plannedQuantity > 0))
      missingInputs.push(`${task.id}: thiếu số lượng kế hoạch hợp lệ.`);
    quantity +=
      task.plannedQuantity > 0
        ? Math.min(1, Math.max(0, task.quantity / task.plannedQuantity))
        : 0;
    if (!(task.quality in qualityMap))
      missingInputs.push(`${task.id}: chưa ánh xạ mức chất lượng.`);
    quality += qualityMap[task.quality] ?? 0;
    const submitted = Date.parse(task.submittedAt);
    const due = Date.parse(task.dueAt);
    if (!Number.isFinite(submitted) || !Number.isFinite(due))
      missingInputs.push(`${task.id}: thiếu ngày nộp/hạn hoàn thành.`);
    else if (submitted <= due + 86_399_999) timely += 1;
  }
  const count = tasks.length || 1;
  const axes: AxisSnapshot[] = [
    {
      code: "A",
      label: "Khối lượng nghiệm thu",
      value: roundScore((quantity / count) * 100),
      detail:
        "Bình quân tỷ lệ khối lượng nghiệm thu/kế hoạch từng việc (tối đa 100%); việc chưa nghiệm thu = 0.",
    },
    {
      code: "B",
      label: "Chất lượng sản phẩm",
      value: roundScore(quality / count),
      detail:
        "Đáp ứng tốt/Vượt yêu cầu = 100; Đáp ứng = 80; Cần cải thiện = 50; Không đạt = 0. Chưa nghiệm thu = 0.",
    },
    {
      code: "C",
      label: "Tiến độ hoàn thành",
      value: roundScore((timely / count) * 100),
      detail: `${timely}/${tasks.length} nhiệm vụ nghiệm thu hoàn thành trước hết ngày đến hạn; thiếu ngày hoàn thành dùng ngày nộp.`,
    },
  ];
  if (leadershipScore !== undefined)
    axes.push({
      code: "D",
      label: "Lãnh đạo, chỉ đạo, điều hành",
      value: leadershipScore,
      detail:
        "Điểm nhập có trách nhiệm giải trình; chỉ dùng trong công thức lãnh đạo/tập thể đang chờ phê duyệt.",
    });
  const average = axes.reduce((sum, axis) => sum + axis.value, 0) / axes.length;
  const calculatedTotal = roundScore(generalScore + average * 0.7);
  return {
    ruleVersion:
      CANDIDATE_RULE + (leadershipScore === undefined ? "-ABC" : "-ABCD"),
    generalScore,
    axes,
    calculatedTotal,
    finalTotal: calculatedTotal,
    taskSnapshots: snapshots,
    missingInputs,
  };
}
