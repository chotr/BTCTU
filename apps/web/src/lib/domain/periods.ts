import type { Evaluation, EvaluationPeriod, Task } from "@/lib/types";

/** Nhiệm vụ thuộc một kỳ theo id, dự phòng theo tên cũ. */
export function taskInPeriod(task: Task, period: EvaluationPeriod): boolean {
  return task.periodId
    ? task.periodId === period.id
    : task.period === period.name;
}

/** Các nhiệm vụ cấu thành một đối tượng đánh giá (cá nhân hoặc tập thể) trong một kỳ. */
export function evaluationTasks(
  tasks: Task[],
  ev: Pick<Evaluation, "subjectId" | "subjectType" | "departmentId">,
  period: EvaluationPeriod,
): Task[] {
  return tasks.filter(
    (task) =>
      taskInPeriod(task, period) &&
      String(task.status) !== "CANCELLED" &&
      (ev.subjectType === "DEPARTMENT"
        ? task.departmentId === ev.departmentId
        : task.assigneeId === ev.subjectId),
  );
}
