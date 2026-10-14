const MIN_SECRET_LENGTH = 16;
const PRODUCTION_MIN_SECRET_LENGTH = 32;

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

function requireString(source: NodeJS.ProcessEnv, name: string): string {
  const value = source[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function isPostgresUrl(value: string): boolean {
  return (
    value.startsWith("postgres://") || value.startsWith("postgresql://")
  );
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function readInteger(
  source: NodeJS.ProcessEnv,
  name: string,
  fallback: number,
  limits: { min: number; max: number },
): number {
  const raw = source[name]?.trim();
  if (!raw) return fallback;

  const value = Number(raw);
  if (!Number.isInteger(value)) {
    throw new Error(`${name} must be an integer, received "${raw}"`);
  }
  if (value < limits.min || value > limits.max) {
    throw new Error(
      `${name} must be between ${limits.min} and ${limits.max}, received ${value}`,
    );
  }

  return value;
}

export function readEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const environment = source.ENVIRONMENT?.trim() || "local";
  const databaseUrl = requireString(source, "DATABASE_URL");
  if (!isPostgresUrl(databaseUrl)) {
    throw new Error("DATABASE_URL must start with postgres:// or postgresql://");
  }

  const jwtAccessSecret = requireString(source, "JWT_ACCESS_SECRET");
  const minimumSecretLength =
    environment === "production"
      ? PRODUCTION_MIN_SECRET_LENGTH
      : MIN_SECRET_LENGTH;
  if (jwtAccessSecret.length < minimumSecretLength) {
    throw new Error(
      `JWT_ACCESS_SECRET must be at least ${minimumSecretLength} characters when ENVIRONMENT is "${environment}"`,
    );
  }

  const corsOrigin = source.CORS_ORIGIN?.trim() || "http://localhost:3000";
  if (!isHttpUrl(corsOrigin)) {
    throw new Error(
      `CORS_ORIGIN must be an absolute http(s) URL, received "${corsOrigin}"`,
    );
  }

  const jwtAccessTtlSeconds = readInteger(
    source,
    "JWT_ACCESS_TTL_SECONDS",
    900,
    { min: 60, max: 86400 },
  );
  const refreshTokenTtlSeconds = readInteger(
    source,
    "REFRESH_TOKEN_TTL_SECONDS",
    604800,
    { min: 300, max: 31536000 },
  );
  if (refreshTokenTtlSeconds <= jwtAccessTtlSeconds) {
    throw new Error(
      "REFRESH_TOKEN_TTL_SECONDS must be greater than JWT_ACCESS_TTL_SECONDS",
    );
  }

  return {
    environment,
    corsOrigin,
    port: readInteger(source, "PORT", 8787, { min: 1, max: 65535 }),
    databaseUrl,
    jwtAccessSecret,
    jwtAccessIssuer: source.JWT_ACCESS_ISSUER?.trim() || "btctu-api",
    jwtAccessAudience: source.JWT_ACCESS_AUDIENCE?.trim() || "btctu-web",
    jwtAccessTtlSeconds,
    refreshTokenTtlSeconds,
  };
}
