import { GetAuthenticatedUser, UserRepository } from '@oitenta/auth';

// O fuso do usuário (P1) vem do cadastro, lido pelo caso de uso do auth a partir do id do token.
export async function userTimezone(
  userRepository: UserRepository,
  userId: string,
): Promise<string> {
  const { user } = await new GetAuthenticatedUser(userRepository).execute({
    userId,
  });
  return user.timezone;
}
