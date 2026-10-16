import { Router } from "express";

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
    const averageScore = state.evaluations.length
      ? Number(
          (
            state.evaluations.reduce(
              (sum, evaluation) => sum + evaluation.score,
              0,
            ) / state.evaluations.length
          ).toFixed(2),
        )
      : 0;

    res.json({
      data: {
        period: state.periods[0],
        tasksByStatus: countBy(state.tasks, (task) => task.status),
        evaluationsByClassification: countBy(
          state.evaluations,
          (evaluation) => evaluation.classification,
        ),
        averageScore,
      },
      meta: { sourceRef: "Dữ liệu đánh giá trong kỳ" },
    });
  });

  return router;
}
