import type { AUTHORIZATION_ACTIONS } from "../constants/authorization";

export type AuthorizationAction = (typeof AUTHORIZATION_ACTIONS)[number];
