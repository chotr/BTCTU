export const ACCESS_COOKIE_NAME = "btctu_access";
export const REFRESH_COOKIE_NAME = "btctu_refresh";

export const ACCESS_COOKIE_PATH = "/api/v1";

export const REFRESH_COOKIE_PATH = "/api/v1/auth";

export type SameSitePolicy = "Strict" | "Lax" | "None";

export type CookieAttributes = {
  path?: string;
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: SameSitePolicy;
};

function serializedAttributes(input: CookieAttributes): string {
  const parts = [`Path=${input.path ?? "/"}`];

  if (typeof input.maxAge === "number") {
    parts.push(`Max-Age=${Math.max(0, Math.floor(input.maxAge))}`);
  }
  if (input.httpOnly) {
    parts.push("HttpOnly");
  }
  if (input.secure) {
    parts.push("Secure");
  }
  parts.push(`SameSite=${input.sameSite ?? "Strict"}`);

  return parts.join("; ");
}

export function serializeCookie(
  name: string,
  value: string,
  attributes: CookieAttributes = {},
): string {
  return `${name}=${encodeURIComponent(value)}; ${serializedAttributes(attributes)}`;
}

export function serializeClearedCookie(
  name: string,
  attributes: CookieAttributes = {},
): string {
  return serializeCookie(name, "", { ...attributes, maxAge: 0 });
}

export function parseCookieHeader(
  header: string | undefined,
): Record<string, string> {
  const jar: Record<string, string> = {};
  if (!header) return jar;

  for (const pair of header.split(";")) {
    const separator = pair.indexOf("=");
    if (separator < 1) continue;

    const name = pair.slice(0, separator).trim();
    if (!name) continue;

    const raw = pair.slice(separator + 1).trim();
    try {
      jar[name] = decodeURIComponent(raw);
    } catch {
      jar[name] = raw;
    }
  }

  return jar;
}
