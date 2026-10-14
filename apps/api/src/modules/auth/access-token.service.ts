import { jwtVerify, SignJWT } from "jose";
import type { AccessTokenClaims } from "./types";

export type AccessTokenService = {
  readonly accessTtlSeconds: number;
  issueAccessToken(userId: string, sessionId: string): Promise<string>;
  verifyAccessToken(token: string): Promise<AccessTokenClaims>;
};

export type HmacJwtTokenServiceConfig = {
  secret: string;
  issuer: string;
  audience: string;
  accessTtlSeconds: number;
};

export class HmacJwtTokenService implements AccessTokenService {
  constructor(private readonly config: HmacJwtTokenServiceConfig) {}

  get accessTtlSeconds(): number {
    return this.config.accessTtlSeconds;
  }

  async issueAccessToken(userId: string, sessionId: string): Promise<string> {
    return new SignJWT({ sid: sessionId })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setSubject(userId)
      .setIssuer(this.config.issuer)
      .setAudience(this.config.audience)
      .setIssuedAt()
      .setExpirationTime(`${this.config.accessTtlSeconds}s`)
      .sign(this.getKey());
  }

  async verifyAccessToken(token: string): Promise<AccessTokenClaims> {
    const { payload } = await jwtVerify(token, this.getKey(), {
      issuer: this.config.issuer,
      audience: this.config.audience,
    });

    if (!payload.sub || typeof payload.sid !== "string") {
      throw new Error("Invalid access token claims");
    }

    return { userId: payload.sub, sessionId: payload.sid };
  }

  private getKey(): Uint8Array {
    return new TextEncoder().encode(this.config.secret);
  }
}
