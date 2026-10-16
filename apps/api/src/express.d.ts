import type { AuthPrincipal } from "./modules/auth/auth.types";
import type { Actor, WorkspaceState } from "./types";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId: string;
      state?: WorkspaceState;
      actor?: Actor;
      validated?: unknown;
      principal?: AuthPrincipal;
    }
  }
}

export {};
