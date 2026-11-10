import { CryptoProvider } from "../../src";

const BCRYPT_PREFIX = "$2b$10$";

export class FakeCryptoProvider implements CryptoProvider {
  readonly encryptedPasswords: string[] = [];
  private readonly hashes = new Map<string, string>();

  async encrypt(password: string): Promise<string> {
    this.encryptedPasswords.push(password);
    const body = Buffer.from(password)
      .toString("hex")
      .padEnd(53, "a")
      .slice(0, 53);
    const hash = `${BCRYPT_PREFIX}${body}`;
    this.hashes.set(hash, password);
    return hash;
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return this.hashes.get(hashedPassword) === password;
  }
}
