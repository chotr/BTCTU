/** Shared id/clock helpers for the mock application layer. */

/** Short, prefixed, collision-resistant client id (`NV-1a2b3c4d`). */
export function uid(prefix: string, upper = false): string {
  const raw = crypto.randomUUID().slice(0, 8);
  return `${prefix}-${upper ? raw.toUpperCase() : raw}`;
}

export const now = (): string => new Date().toISOString();
