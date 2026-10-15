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

  it("accepts the separators used by uuids, trace ids and prefixed names", () => {
    expect(validExternalRequestId("0af7651916cd43dd8448eb211c80319c")).toBe(
      "0af7651916cd43dd8448eb211c80319c",
    );
    expect(
      validExternalRequestId("00-4bf92f3577b34da6a3ce929d0e0e4736-01"),
    ).toBe("00-4bf92f3577b34da6a3ce929d0e0e4736-01");
    expect(validExternalRequestId("checkout_v2:01H8Z.svc-a")).toBe(
      "checkout_v2:01H8Z.svc-a",
    );
  });

  it("rejects a value with inner whitespace or a line break", () => {
    expect(validExternalRequestId("req 1")).toBeUndefined();
    expect(validExternalRequestId("req\n1")).toBeUndefined();
    expect(validExternalRequestId("req\r\nset-cookie: x=1")).toBeUndefined();
  });

  it("rejects control characters", () => {
    expect(validExternalRequestId("req\u0000-1")).toBeUndefined();
    expect(validExternalRequestId("req\u001b[31m")).toBeUndefined();
  });

  it("rejects characters that could break a header or a log line", () => {
    expect(validExternalRequestId('req"1')).toBeUndefined();
    expect(validExternalRequestId("req<1>")).toBeUndefined();
    expect(validExternalRequestId("team/1")).toBeUndefined();
    expect(validExternalRequestId("id=1")).toBeUndefined();
    expect(validExternalRequestId("mã-01")).toBeUndefined();
  });
});
