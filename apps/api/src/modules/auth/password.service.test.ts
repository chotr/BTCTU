import { describe, expect, it } from "vitest";
import { PasswordService } from "./password.service";
import { beforeEach } from "node:test";

describe("PasswordService", () => {
  let service: PasswordService;

  beforeEach(() => {
    service = new PasswordService();
  });

  describe("hash", () => {
    it("should hash a password", async () => {
      const password = "MySecurePassword123!";

      const hash = await service.hash(password);
      expect(hash).toBeTypeOf("string");
      expect(hash).not.toBe(password);
      expect(hash).toMatch(/^\$argon2id\$/);
    });

    it("should generate different hashes for same password", async () => {
      const password = "MySecurePassword123!";

      const hash1 = await service.hash(password);
      const hash2 = await service.hash(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verify", () => {
    it("should return true for correct password", async () => {
      const password = "MySecurePassword123!";
      const hash = await service.hash(password);
      const result = await service.verify(hash, password);

      expect(result).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const hash = await service.hash("CorrectPassword123!");

      const result = await service.verify(
        hash,
        "WrongPassword123!"
      );

      expect(result).toBe(false);
    });

    it("should reject invalid password hash", async () => {
      await expect(
        service.verify("invalid-hash", "password")
      ).rejects.toThrow();
    });
  });
});
