import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { Env } from "@/env";
import { accessTokenFromRequest } from "@/middleware/authentication";
import type { AuthPort } from "@/modules/auth/auth.types";
import { ACCESS_COOKIE_NAME } from "@/security/cookie";
import { problem } from "@/shared/problem";
import type { WorkspaceState } from "@/types";
import type { ActorResolver } from "./actor-resolver";

export type ActorMiddlewareOptions = {
  env: Env;
  auth: AuthPort;
  actorResolver: ActorResolver;
  state: WorkspaceState;
};

export function createActorMiddleware(
  options: ActorMiddlewareOptions,
): RequestHandler {
  const { env, auth, actorResolver, state } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    req.state = state;

    let userId: string;

    if (env.environment === "production") {
      const token = accessTokenFromRequest(req, ACCESS_COOKIE_NAME);
      if (!token) {
        problem(
          req,
          res,
          401,
          "Unauthorized",
          "An access token is required.",
          "missing_access_token",
        );
        return;
      }

      try {
        req.principal = await auth.authenticate(token);
      } catch {
        problem(
          req,
          res,
          401,
          "Unauthorized",
          "The access token is invalid or expired.",
          "invalid_access_token",
        );
        return;
      }

      const user = await auth.currentUser(req.principal);
      if (!user) {
        problem(
          req,
          res,
          401,
          "Unauthorized",
          "The account behind this session is no longer active.",
          "inactive_account",
        );
        return;
      }

      userId = user.id;
    } else {
      const header = req.header("x-dev-user-id");
      if (!header) {
        problem(
          req,
          res,
          401,
          "Unauthorized",
          "A development identity header is required.",
          "unknown_actor",
        );
        return;
      }

      userId = header;
    }

    const actor = await actorResolver.resolve(userId);
    if (!actor) {
      if (env.environment === "production") {
        problem(
          req,
          res,
          403,
          "Forbidden",
          "This account is not linked to a person in the directory.",
          "actor_not_provisioned",
        );
      } else {
        problem(
          req,
          res,
          401,
          "Unauthorized",
          "Unknown or missing actor identity.",
          "unknown_actor",
        );
      }
      return;
    }

    req.actor = actor;
    next();
  };
}
