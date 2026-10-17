export const ACCOUNT_STATUSES = ["ACTIVE", "DISABLED"] as const;

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const ACCOUNT_ROLES = ["USER", "ACCOUNT_ADMIN", "ROOT"] as const;

export type AccountRole = (typeof ACCOUNT_ROLES)[number];

export type AuthenticatedUser = {
  id: string;
  email: string;
  status: AccountStatus;
  accountRole: AccountRole;
  mustChangePassword: boolean;
  directoryActorId: string | null;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponseData = {
  user: AuthenticatedUser;
  expiresIn: number;
};
