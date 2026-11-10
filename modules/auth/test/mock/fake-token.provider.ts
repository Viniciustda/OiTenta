import { TokenPayload, TokenProvider } from "../../src";

export class FakeTokenProvider implements TokenProvider {
  readonly generatedPayloads: TokenPayload[] = [];

  async generate(payload: TokenPayload): Promise<string> {
    this.generatedPayloads.push(payload);
    return `fake-token:${payload.sub}:${payload.email}`;
  }

  async verify(token: string): Promise<TokenPayload> {
    const [prefix, sub, email] = token.split(":");
    if (prefix !== "fake-token" || !sub || !email) {
      throw new Error("Token inválido.");
    }
    return { sub, email };
  }
}
