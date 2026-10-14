import argon2 from "argon2";

export class PasswordService {
  private decoyHash: string | null = null;

  async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
    });
  }

  async verify(passwordHash: string, password: string): Promise<boolean> {
    return argon2.verify(passwordHash, password);
  }
  async verifyDecoy(password: string): Promise<false> {
    this.decoyHash ??= await this.hash("btctu-decoy-password");
    await this.verify(this.decoyHash, password).catch(() => false);
    return false;
  }
}
