import { NotFoundError, UseCase } from "@oitenta/shared";
import { TokenProvider, UserRepository } from "../provider";
import { LoginUserOut } from "./login-user.usecase";
import { normalizeEmail, toPublicUser } from "./public-user";

export interface LoginDemoUserIn {
  demoEmail: string;
}

export class LoginDemoUser implements UseCase<LoginDemoUserIn, LoginUserOut> {
  constructor(
    private readonly tokenProvider: TokenProvider,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: LoginDemoUserIn): Promise<LoginUserOut> {
    const user = await this.userRepository.findByEmail(
      normalizeEmail(input.demoEmail),
    );
    if (!user) {
      throw new NotFoundError("Usuário de demonstração não encontrado.");
    }

    const token = await this.tokenProvider.generate({
      sub: user.id,
      email: user.email,
    });

    return { token, user: toPublicUser(user) };
  }
}
