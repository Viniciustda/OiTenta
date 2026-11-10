import { UnauthorizedError, UseCase } from "@oitenta/shared";
import { UserRepository } from "../provider";
import { PublicUser, toPublicUser } from "./public-user";

export interface GetAuthenticatedUserIn {
  userId: string;
}

export interface GetAuthenticatedUserOut {
  user: PublicUser;
}

export class GetAuthenticatedUser
  implements UseCase<GetAuthenticatedUserIn, GetAuthenticatedUserOut>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: GetAuthenticatedUserIn): Promise<GetAuthenticatedUserOut> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new UnauthorizedError("Usuário não autenticado.");
    }

    return { user: toPublicUser(user) };
  }
}
