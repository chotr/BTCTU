
export function normalizeOrigin(origin: string): string {
  return origin.trim().toLowerCase().replace(/\/+$/, "");
}


export function isOriginAllowed(
  origin: string | undefined,
  allowedOrigins: string[],
): boolean {
  if (!origin) return true;

  const candidate = normalizeOrigin(origin);
  return allowedOrigins.some((allowed) => normalizeOrigin(allowed) === candidate);
}
