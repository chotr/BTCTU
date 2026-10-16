/** Tiện ích id và đồng hồ dùng chung cho tầng ứng dụng. */

/** Id phía client ngắn, có tiền tố, hạn chế trùng lặp (`NV-1a2b3c4d`). */
export function uid(prefix: string, upper = false): string {
  const raw = crypto.randomUUID().slice(0, 8);
  return `${prefix}-${upper ? raw.toUpperCase() : raw}`;
}

export const now = (): string => new Date().toISOString();
