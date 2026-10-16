import { Router } from "express";

export const PUBLISHED_CATALOG_VERSION = "v1.1";

export function createCatalogRouter(): Router {
  const router = Router();

  router.get("/catalog", (req, res) =>
    res.json({
      data: req.state!.catalog,
      meta: {
        publishedVersion: PUBLISHED_CATALOG_VERSION,
        draftVersion: "v1.0",
        sourceNote:
          "Excel rows remain operational/master-data draft until approved.",
      },
    }),
  );

  return router;
}
