import { ROLES, type Actor } from "@/types";

export type AuthorizationAction =
  | "task.create"
  | "task.accept"
  | "task.return"
  | "evaluation.self"
  | "evaluation.review"
  | "evaluation.decide"
  | "period.lock"
  | "audit.read";

export type AuthorizationResource = {
  departmentId?: string | null;
  subjectId?: string | null;
};

export type AuthorizationRequest = {
  action: AuthorizationAction;
  resource?: AuthorizationResource;
};

export type AuthorizationRule = (
  actor: Actor,
  resource: AuthorizationResource,
) => boolean;

function sameDepartment(
  actor: Actor,
  resource: AuthorizationResource,
): boolean {
  return (
    actor.departmentId !== null && actor.departmentId === resource.departmentId
  );
}

function canAssignInDepartment(
  actor: Actor,
  resource: AuthorizationResource,
): boolean {
  return (
    actor.role === ROLES.lanhDao ||
    (actor.role === ROLES.truongPhong && sameDepartment(actor, resource))
  );
}

export const AUTHORIZATION_RULES: Record<
  AuthorizationAction,
  AuthorizationRule
> = {
  "task.create": canAssignInDepartment,
  "task.accept": canAssignInDepartment,
  "task.return": canAssignInDepartment,
  "evaluation.review": canAssignInDepartment,
  "evaluation.self": (actor, resource) => actor.id === resource.subjectId,
  "evaluation.decide": (actor) => actor.role === ROLES.lanhDao,
  "period.lock": (actor) => actor.role === ROLES.lanhDao,
  "audit.read": (actor) => actor.role !== ROLES.congChuc,
};

export function can(actor: Actor, request: AuthorizationRequest): boolean {
  return AUTHORIZATION_RULES[request.action](actor, request.resource ?? {});
}
