import { UnauthorizedError, UseCase } from "@oitenta/shared";
import { CryptoProvider, TokenProvider, UserRepository } from "../provider";
import { normalizeEmail, PublicUser, toPublicUser } from "./public-user";

export const INVALID_CREDENTIALS_MESSAGE = "Credenciais inválidas.";

export interface LoginUserIn {
  email: string;
  password: string;
}

export interface LoginUserOut {
  token: string;
  user: PublicUser;
}

export class LoginUser implements UseCase<LoginUserIn, LoginUserOut> {
  constructor(
    private readonly cryptoProvider: CryptoProvider,
    private readonly tokenProvider: TokenProvider,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: LoginUserIn): Promise<LoginUserOut> {
    const user = await this.userRepository.findByEmail(
      normalizeEmail(input.email ?? ""),
    );
    if (!user) {
      throw new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE);
    }

    const matches = await this.cryptoProvider.compare(
      input.password ?? "",
      user.password,
    );
    if (!matches) {
      throw new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE);
    }

    const token = await this.tokenProvider.generate({
      sub: user.id,
      email: user.email,
    });

    return { token, user: toPublicUser(user) };
  }
}
