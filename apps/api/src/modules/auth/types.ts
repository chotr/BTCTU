type CreateUserInput = {
  email: string;
  passwordHash: string;
};

type CreateSessionInput = {
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
};