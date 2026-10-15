import { Router } from "express";
import type { Env } from "@/env";

export function createIdentityRouter(env: Env): Router {
  const router = Router();

  router.get("/me", (req, res) =>
    res.json({
      data: req.actor,
      meta: {
        identityMode:
          env.environment === "production"
            ? "access-token"
            : "development-header",
      },
    }),
  );

  return router;
}
