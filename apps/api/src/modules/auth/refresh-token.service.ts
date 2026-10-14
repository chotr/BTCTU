import { createHash, randomBytes } from "node:crypto";

const REFRESH_TOKEN_BYTES = 32;
const REFRESH_TOKEN_ENCODING = "base64url";
const REFRESH_TOKEN_HASH_ALGORITHM = "sha256";

export class RefreshTokenService {
  generate(): string {
    return randomBytes(REFRESH_TOKEN_BYTES).toString(REFRESH_TOKEN_ENCODING);
  }

  hash(refreshToken: string): string {
    return createHash(REFRESH_TOKEN_HASH_ALGORITHM)
      .update(refreshToken)
      .digest("hex");
  }
}
