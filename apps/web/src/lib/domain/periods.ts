import type { Evaluation, EvaluationPeriod, Task } from "@/lib/types";

/** Tasks belong to a period by id, falling back to legacy names. */
export function taskInPeriod(task: Task, period: EvaluationPeriod): boolean {
  return task.periodId
    ? task.periodId === period.id
    : task.period === period.name;
}

/** Tasks that feed an evaluation subject (person or collective) in a period. */
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
