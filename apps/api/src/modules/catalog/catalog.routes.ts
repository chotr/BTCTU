import { Router } from "express";

export function createCatalogRouter(): Router {
  const router = Router();

  router.get("/catalog", (req, res) =>
    res.json({
      data: req.state!.catalog,
      meta: {
        publishedVersion: "v1.1",
        draftVersion: "v1.0",
        sourceNote:
          "Excel rows remain operational/master-data draft until approved.",
      },
    }),
  );

  return router;
}
