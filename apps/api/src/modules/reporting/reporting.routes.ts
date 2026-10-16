import { Router } from "express";
import { canReadEvaluation, canReadTask } from "@/middleware/authorization";

function countBy<T>(items: T[], keyOf: (item: T) => string) {
  return Object.fromEntries(
    [...new Set(items.map(keyOf))].map((key) => [
      key,
      items.filter((item) => keyOf(item) === key).length,
    ]),
  );
}

export function createReportingRouter(): Router {
  const router = Router();

  router.get("/reports/summary", (req, res) => {
    const state = req.state!;
    const actor = req.actor!;
    const visibleTasks = state.tasks.filter((t) => canReadTask(actor, t));
    const visibleEvaluations = state.evaluations.filter((e) =>
      canReadEvaluation(actor, e),
    );

    const averageScore = visibleEvaluations.length
      ? Number(
          (
            visibleEvaluations.reduce(
              (sum, evaluation) => sum + evaluation.score,
              0,
            ) / visibleEvaluations.length
          ).toFixed(2),
        )
      : 0;

    res.json({
      data: {
        period: state.periods[0],
        tasksByStatus: countBy(visibleTasks, (task) => task.status),
        evaluationsByClassification: countBy(
          visibleEvaluations,
          (evaluation) => evaluation.classification,
        ),
        averageScore,
      },
      meta: { sourceRef: "Dữ liệu đánh giá trong kỳ" },
    });
  });

  return router;
}
