import { describe, expect, it } from "vitest";
import { MemoryLoginThrottle } from "./login-throttle";

function createThrottle(
  options: { maxAttempts?: number; windowMs?: number; now?: () => Date } = {},
) {
  return new MemoryLoginThrottle({
    maxAttempts: options.maxAttempts ?? 2,
    windowMs: options.windowMs ?? 60_000,
    now: options.now,
  });
}

describe("MemoryLoginThrottle", () => {
  it("allows a key it has never seen", async () => {
    await expect(createThrottle().check("a")).resolves.toEqual({
      allowed: true,
      retryAfterSeconds: 0,
    });
  });

  it("blocks the key once its attempts are used up", async () => {
    const throttle = createThrottle({ maxAttempts: 2 });
    await throttle.recordFailure("a");
    await throttle.recordFailure("a");

    const decision = await throttle.check("a");

    expect(decision.allowed).toBe(false);
    expect(decision.retryAfterSeconds).toBe(60);
    await expect(throttle.check("b")).resolves.toEqual({
      allowed: true,
      retryAfterSeconds: 0,
    });
  });

  it("frees the key once the window passed", async () => {
    let now = new Date("2026-10-14T00:00:00.000Z");
    const throttle = createThrottle({
      maxAttempts: 1,
      windowMs: 60_000,
      now: () => now,
    });
    await throttle.recordFailure("a");
    now = new Date("2026-10-14T00:02:00.000Z");

    await expect(throttle.check("a")).resolves.toEqual({
      allowed: true,
      retryAfterSeconds: 0,
    });
  });

  it("clears the key after a successful sign-in", async () => {
    const throttle = createThrottle({ maxAttempts: 1 });
    await throttle.recordFailure("a");

    await throttle.reset("a");

    await expect(throttle.check("a")).resolves.toEqual({
      allowed: true,
      retryAfterSeconds: 0,
    });
  });
});
