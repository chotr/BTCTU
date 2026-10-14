import type { ROLES } from "../constants/roles";

export type Role = (typeof ROLES)[keyof typeof ROLES];
