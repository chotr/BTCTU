import { Router } from "express";

export function createOrganizationRouter(): Router {
  const router = Router();

  router.get("/organizations", (req, res) =>
    res.json({
      data: {
        departments: req.state!.departments,
        people: req.state!.people,
      },
      meta: { sourceClass: "FACT", sourceRef: "QĐ01, Điều 2–7" },
    }),
  );

  return router;
}
