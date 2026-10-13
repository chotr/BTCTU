import { TokenServiceConfig } from "./types";

export class TokenService {
  constructor(private readonly config: TokenServiceConfig) {}

  private getAccessKey(): Uint8Array {
    return new TextEncoder().encode(this.config.accessSecret);
  }

  async issueAccessToken() {}

  async verifyAccessToken() {}

  async generateRefreshToken() {}

  async hashRefreshToken() {}
}
