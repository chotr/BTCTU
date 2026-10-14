import { describe, expect, it } from "vitest";
import {
  parseCookieHeader,
  serializeClearedCookie,
  serializeCookie,
} from "./cookie";

describe("cookie helpers", () => {
  it("serializes the value and every attribute", () => {
    expect(
      serializeCookie("btctu_refresh", "a/b+c", {
        path: "/api/v1/auth",
        maxAge: 604800,
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
      }),
    ).toBe(
      "btctu_refresh=a%2Fb%2Bc; Path=/api/v1/auth; Max-Age=604800; HttpOnly; Secure; SameSite=Strict",
    );
  });

  it("parses a Cookie header into decoded values", () => {
    expect(
      parseCookieHeader("first=1; second=x%20y; third=a%2Fb"),
    ).toEqual({ first: "1", second: "x y", third: "a/b" });
  });

  it("encodes a value so that it survives a round trip", () => {
    const value = "a/b+c d";
    const cookiePair = serializeCookie("btctu_refresh", value).split(";")[0];

    expect(parseCookieHeader(cookiePair)).toEqual({ btctu_refresh: value });
  });

  it("clears a cookie with an immediate expiry on the original path", () => {
    expect(
      serializeClearedCookie("btctu_refresh", {
        path: "/api/v1/auth",
        httpOnly: true,
      }),
    ).toBe(
      "btctu_refresh=; Path=/api/v1/auth; Max-Age=0; HttpOnly; SameSite=Strict",
    );
  });

  it("ignores malformed pairs and keeps undecodable values", () => {
    expect(parseCookieHeader("=empty; broken; novalue; uuid=%E0%A4%A")).toEqual({
      uuid: "%E0%A4%A",
    });
  });

  it("returns an empty jar when there is no header", () => {
    expect(parseCookieHeader(undefined)).toEqual({});
  });
});
