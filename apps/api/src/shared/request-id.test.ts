import { describe, expect, it } from "vitest";
import { AUDIT_REQUEST_ID_MAX_LENGTH } from "@/db/schema/audit-events";
import { validExternalRequestId } from "./request-id";

describe("validExternalRequestId", () => {
  it("accepts a normal correlation id untrimmed", () => {
    expect(validExternalRequestId("abc")).toBe("abc");
  });

  it("accepts an id exactly at the length limit", () => {
    const id = "x".repeat(AUDIT_REQUEST_ID_MAX_LENGTH);
    expect(validExternalRequestId(id)).toBe(id);
  });

  it("rejects an id past the length limit", () => {
    const tooLong = "x".repeat(AUDIT_REQUEST_ID_MAX_LENGTH + 1);
    expect(validExternalRequestId(tooLong)).toBeUndefined();
  });

  it("trims surrounding whitespace", () => {
    expect(validExternalRequestId("  req-1  ")).toBe("req-1");
  });

  it("rejects a missing or blank value", () => {
    expect(validExternalRequestId(undefined)).toBeUndefined();
    expect(validExternalRequestId("   ")).toBeUndefined();
  });
});
