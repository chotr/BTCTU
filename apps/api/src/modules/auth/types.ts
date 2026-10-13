export type CreateUserInput = {
  email: string;
  passwordHash: string;
};

export type CreateSessionInput = {
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
};