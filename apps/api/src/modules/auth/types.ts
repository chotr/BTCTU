export type CreateUserInput = {
  email: string;
  passwordHash: string;
};

export type CreateSessionInput = {
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
};

export type AccessTokenClaims = {
  userId: string;
  sessionId: string;
};

export type TokenServiceConfig = {
  accessSecret: string;
  issuer: string;
  audience: string;
  accessTtlSeconds: number;
};