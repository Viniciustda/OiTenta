import {
  ConflictError,
  StrongPasswordRule,
  UseCase,
  Validator,
} from "@oitenta/shared";
import { User } from "../model";
import { CryptoProvider, UserRepository } from "../provider";
import { normalizeEmail, PublicUser, toPublicUser } from "./public-user";

// Fuso usado quando o cliente não informa o dele (decisão P1).
export const DEFAULT_TIMEZONE = "America/Sao_Paulo";

export interface RegisterUserIn {
  name: string;
  email: string;
  password: string;
  timezone?: string;
}

export interface RegisterUserOut {
  user: PublicUser;
}

export class RegisterUser implements UseCase<RegisterUserIn, RegisterUserOut> {
  constructor(
    private readonly cryptoProvider: CryptoProvider,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: RegisterUserIn): Promise<RegisterUserOut> {
    Validator.validate([
      {
        code: "user.password",
        value: input.password,
        rules: [new StrongPasswordRule()],
      },
    ]);

    const email = normalizeEmail(input.email);
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError("E-mail já cadastrado.");
    }

    const hashedPassword = await this.cryptoProvider.encrypt(input.password);
    const user = new User({
      name: input.name,
      email,
      password: hashedPassword,
      timezone: input.timezone ?? DEFAULT_TIMEZONE,
    });
    user.validate();

    await this.userRepository.create(user);

    return { user: toPublicUser(user) };
  }
}
