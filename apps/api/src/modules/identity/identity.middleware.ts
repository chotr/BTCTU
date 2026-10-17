import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { Env } from "@/env";
import { accessTokenFromRequest } from "@/middleware/authentication";
import type { AuthenticatedUser, AuthPort } from "@/modules/auth/auth.types";
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

    let user: AuthenticatedUser | null = null;
    let userId: string;
    const token = accessTokenFromRequest(req, ACCESS_COOKIE_NAME);

    if (token) {
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

      user = await auth.currentUser(req.principal);
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

      if (user.mustChangePassword) {
        problem(
          req,
          res,
          403,
          "Password change required",
          "Change the temporary password before using the application.",
          "password_change_required",
        );
        return;
      }

      userId = user.directoryActorId ?? user.id;
    } else if (env.environment === "production") {
      problem(
        req,
        res,
        401,
        "Unauthorized",
        "An access token is required.",
        "missing_access_token",
      );
      return;
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

    const actor = await actorResolver(userId);

    if (!actor) {
      if (user) {
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
