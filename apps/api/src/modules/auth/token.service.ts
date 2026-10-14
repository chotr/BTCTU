import { createHash, randomBytes } from "node:crypto";
import { AccessTokenClaims, TokenServiceConfig } from "./types";
import { SignJWT, jwtVerify } from "jose";

export class TokenService {
  constructor(private readonly config: TokenServiceConfig) {}

  get accessTtlSeconds(): number {
    return this.config.accessTtlSeconds;
  }

  private getAccessKey(): Uint8Array {
    return new TextEncoder().encode(this.config.accessSecret);
  }

  async issueAccessToken(userId: string, sessionId: string): Promise<string> {
    return new SignJWT({ sid: sessionId })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setSubject(userId)
      .setIssuer(this.config.issuer)
      .setAudience(this.config.audience)
      .setIssuedAt()
      .setExpirationTime(`${this.config.accessTtlSeconds}s`)
      .sign(this.getAccessKey());
  }

  async verifyAccessToken(token: string): Promise<AccessTokenClaims> {
    const { payload } = await jwtVerify(token, this.getAccessKey(), {
      issuer: this.config.issuer,
      audience: this.config.audience,
    });

    if (!payload.sub || typeof payload.sid !== "string") {
      throw new Error("Invalid access token claims");
    }

    return {
      userId: payload.sub,
      sessionId: payload.sid,
    };
  }

  generateRefreshToken(): string {
    return randomBytes(32).toString("base64url");
  }

  hashRefreshToken(refreshToken: string): string {
    return createHash("sha256").update(refreshToken).digest("hex");
  }
}
