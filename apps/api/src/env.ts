import {
  cookiePolicyForProfile,
  type CookiePolicy,
  type SameSitePolicy,
} from "./security/cookie";

const MIN_SECRET_LENGTH = 16;
const PRODUCTION_MIN_SECRET_LENGTH = 32;

export type AuthConfig = {
  loginMaxAttempts: number;
  loginWindowSeconds: number;
  rotationGraceSeconds: number;
};

export type Env = {
  environment: string;
  corsOrigins: string[];
  port: number;
  publicBaseUrl: string;
  problemTypeBase: string;
  requestBodyLimit: string;
  databaseUrl: string;
  jwtAccessSecret: string;
  jwtAccessIssuer: string;
  jwtAccessAudience: string;
  jwtAccessTtlSeconds: number;
  refreshTokenTtlSeconds: number;
  cookiePolicy: CookiePolicy;
  auth: AuthConfig;
};

function requireString(source: NodeJS.ProcessEnv, name: string): string {
  const value = source[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function isPostgresUrl(value: string): boolean {
  return value.startsWith("postgres://") || value.startsWith("postgresql://");
}

export function normalizePostgresUrl(raw: string): string {
  const trimmed = raw.trim();
  const separatorIndex = trimmed.indexOf("://");
  if (separatorIndex === -1) return trimmed;

  const scheme = trimmed.slice(0, separatorIndex);
  const rest = trimmed.slice(separatorIndex + 3);

  // The last '@' separates credentials from endpoint (host[:port]/database?...)
  const lastAt = rest.lastIndexOf("@");
  if (lastAt === -1) return trimmed;

  const credentials = rest.slice(0, lastAt);
  const endpoint = rest.slice(lastAt + 1);

  const firstColon = credentials.indexOf(":");
  if (firstColon === -1) return trimmed;

  const username = credentials.slice(0, firstColon);
  const password = credentials.slice(firstColon + 1);

  const safeDecode = (val: string) => {
    try {
      return decodeURIComponent(val);
    } catch {
      return val;
    }
  };

  const encodedUser = encodeURIComponent(safeDecode(username));
  const encodedPass = encodeURIComponent(safeDecode(password));

  return `${scheme}://${encodedUser}:${encodedPass}@${endpoint}`;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Không gian tên của `type` trong problem+json. Mặc định đi theo địa chỉ công
// khai của triển khai; đặt `PROBLEM_TYPE_BASE` khi muốn một định danh cố định
// dùng chung giữa các môi trường.
function readProblemTypeBase(
  source: NodeJS.ProcessEnv,
  publicBaseUrl: string,
): string {
  const raw = source.PROBLEM_TYPE_BASE?.trim() || `${publicBaseUrl}/problems`;
  const normalized = raw.replace(/\/+$/, "");
  if (!isHttpUrl(normalized)) {
    throw new Error(
      `PROBLEM_TYPE_BASE must be an absolute http(s) URL, received "${raw}"`,
    );
  }

  return normalized;
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

function readOptionalBoolean(
  source: NodeJS.ProcessEnv,
  name: string,
): boolean | undefined {
  const raw = source[name]?.trim().toLowerCase();
  if (!raw) return undefined;
  if (["true", "1", "yes"].includes(raw)) return true;
  if (["false", "0", "no"].includes(raw)) return false;

  throw new Error(`${name} must be true or false, received "${raw}"`);
}

function readOrigins(source: NodeJS.ProcessEnv): string[] {
  const raw =
    source.CORS_ORIGINS?.trim() ||
    source.CORS_ORIGIN?.trim() ||
    "http://localhost:3000";

  const origins = raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (origins.length === 0) {
    throw new Error("CORS_ORIGINS must list at least one origin");
  }

  for (const origin of origins) {
    if (!isHttpUrl(origin)) {
      throw new Error(
        `CORS_ORIGINS must list absolute http(s) URLs, received "${origin}"`,
      );
    }
  }

  return origins;
}

function readSameSite(source: NodeJS.ProcessEnv): SameSitePolicy | undefined {
  const raw = source.AUTH_COOKIE_SAME_SITE?.trim();
  if (!raw) return undefined;

  const policies: Record<string, SameSitePolicy> = {
    strict: "Strict",
    lax: "Lax",
    none: "None",
  };
  const policy = policies[raw.toLowerCase()];
  if (!policy) {
    throw new Error(
      `AUTH_COOKIE_SAME_SITE must be Strict, Lax or None, received "${raw}"`,
    );
  }

  return policy;
}

export function readEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const environment = source.ENVIRONMENT?.trim() || "local";
  const rawDatabaseUrl = requireString(source, "DATABASE_URL");
  if (!isPostgresUrl(rawDatabaseUrl)) {
    throw new Error(
      "DATABASE_URL must start with postgres:// or postgresql://",
    );
  }
  const databaseUrl = normalizePostgresUrl(rawDatabaseUrl);

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

  const port = readInteger(source, "PORT", 8787, { min: 1, max: 65535 });
  const publicBaseUrl =
    source.PUBLIC_BASE_URL?.trim() || `http://localhost:${port}`;
  if (!isHttpUrl(publicBaseUrl)) {
    throw new Error(
      `PUBLIC_BASE_URL must be an absolute http(s) URL, received "${publicBaseUrl}"`,
    );
  }
  const problemTypeBase = readProblemTypeBase(source, publicBaseUrl);

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

  const cookiePolicy = cookiePolicyForProfile(environment, {
    secure: readOptionalBoolean(source, "AUTH_COOKIE_SECURE"),
    sameSite: readSameSite(source),
  });
  if (cookiePolicy.sameSite === "None" && !cookiePolicy.secure) {
    throw new Error(
      "AUTH_COOKIE_SAME_SITE=None requires AUTH_COOKIE_SECURE=true",
    );
  }

  return {
    environment,
    corsOrigins: readOrigins(source),
    port,
    publicBaseUrl,
    problemTypeBase,
    requestBodyLimit: source.REQUEST_BODY_LIMIT?.trim() || "1mb",
    databaseUrl,
    jwtAccessSecret,
    jwtAccessIssuer: source.JWT_ACCESS_ISSUER?.trim() || "btctu-api",
    jwtAccessAudience: source.JWT_ACCESS_AUDIENCE?.trim() || "btctu-web",
    jwtAccessTtlSeconds,
    refreshTokenTtlSeconds,
    cookiePolicy,
    auth: {
      loginMaxAttempts: readInteger(source, "AUTH_LOGIN_MAX_ATTEMPTS", 10, {
        min: 1,
        max: 1000,
      }),
      loginWindowSeconds: readInteger(source, "AUTH_LOGIN_WINDOW_SECONDS", 60, {
        min: 1,
        max: 86400,
      }),
      rotationGraceSeconds: readInteger(
        source,
        "AUTH_REFRESH_ROTATION_GRACE_SECONDS",
        30,
        { min: 0, max: 3600 },
      ),
    },
  };
}
