import type {
  AuthPrincipal,
  AuthenticatedUser,
} from "./modules/auth/auth.types";
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
      account?: AuthenticatedUser;
    }
  }
}

export {};
