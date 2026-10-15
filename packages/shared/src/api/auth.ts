export const ACCOUNT_STATUSES = ["ACTIVE", "DISABLED"] as const;

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export type AuthenticatedUser = {
  id: string;
  email: string;
  status: AccountStatus;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponseData = {
  user: AuthenticatedUser;
  expiresIn: number;
};
