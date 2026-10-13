export type Env = {
  environment: string;
  corsOrigin: string;
  port: number;
  databaseUrl: string;
  jwtAccessSecret: string;
  jwtAccessIssuer: string;
  jwtAccessAudience: string;
  jwtAccessTtlSeconds: number;
  refreshTokenTtlSeconds: number;
};

export function readEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const databaseUrl = source.DATABASE_URL;
  const jwtAccessSecret = source.JWT_ACCESS_SECRET;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  if (!jwtAccessSecret) {
    throw new Error("JWT_ACCESS_SECRET is required");
  }

  return {
    environment: source.ENVIRONMENT ?? "local",
    corsOrigin: source.CORS_ORIGIN ?? "http://localhost:3000",
    port: Number(source.PORT ?? 8787),
    databaseUrl,
    jwtAccessSecret,
    jwtAccessIssuer: source.JWT_ACCESS_ISSUER ?? "btctu-api",
    jwtAccessAudience: source.JWT_ACCESS_AUDIENCE ?? "btctu-web",
    jwtAccessTtlSeconds: Number(source.JWT_ACCESS_TTL_SECONDS ?? 900),
    refreshTokenTtlSeconds: Number(source.REFRESH_TOKEN_TTL_SECONDS ?? 604800),
  };
}
