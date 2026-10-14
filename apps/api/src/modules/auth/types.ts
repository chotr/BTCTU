export type CreateUserInput = {
  email: string;
  passwordHash: string;
};

export type CreateSessionInput = {
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
};

export type RotateSessionInput = {
  sessionId: string;
  currentHash: string;
  nextHash: string;
  usedAt: Date;
};

export type AccessTokenClaims = {
  userId: string;
  sessionId: string;
};
