import { describe, expect, it } from "vitest";
import { normalizePostgresUrl } from "./env";

describe("normalizePostgresUrl", () => {
  it("preserves standard valid postgres url", () => {
    const url = "postgres://user:password123@localhost:5432/mydb";
    expect(normalizePostgresUrl(url)).toBe(url);
  });

  it("encodes unencoded special characters in password", () => {
    const raw =
      "postgres://user:my@secret#pass@db.example.com:6543/postgres?sslmode=require";
    const normalized = normalizePostgresUrl(raw);
    expect(() => new URL(normalized)).not.toThrow();
    expect(normalized).toContain(
      "my%40secret%23pass@db.example.com:6543/postgres",
    );
  });

  it("handles password with forward slashes correctly", () => {
    const raw =
      "postgresql://postgres.user:pass/with/slashes/123@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";
    const normalized = normalizePostgresUrl(raw);
    const parsed = new URL(normalized);
    expect(parsed.hostname).toBe(
      "aws-0-ap-southeast-1.pooler.supabase.com",
    );
    expect(parsed.port).toBe("6543");
    expect(decodeURIComponent(parsed.password)).toBe(
      "pass/with/slashes/123",
    );
  });

  it("handles password with multiple @ symbols correctly", () => {
    const raw = "postgresql://admin:a@b@c@host:5432/db";
    const normalized = normalizePostgresUrl(raw);
    const parsed = new URL(normalized);
    expect(parsed.hostname).toBe("host");
    expect(parsed.port).toBe("5432");
    expect(decodeURIComponent(parsed.password)).toBe("a@b@c");
  });
});
