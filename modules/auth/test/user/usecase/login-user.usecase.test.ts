import { UnauthorizedError } from "@oitenta/shared";
import { INVALID_CREDENTIALS_MESSAGE, LoginUser, RegisterUser } from "../../../src";
import { FakeCryptoProvider, FakeTokenProvider, FakeUserRepository } from "../../mock";

async function makeSut() {
  const cryptoProvider = new FakeCryptoProvider();
  const tokenProvider = new FakeTokenProvider();
  const userRepository = new FakeUserRepository();
  const { user } = await new RegisterUser(cryptoProvider, userRepository).execute({
    name: "Ana Souza",
    email: "ana@bora.app",
    password: "Strong@123",
  });
  const useCase = new LoginUser(cryptoProvider, tokenProvider, userRepository);
  return { tokenProvider, useCase, user };
}

describe("LoginUser", () => {
  test("deve devolver token com sub = id do usuario e o usuario sem senha", async () => {
    const { tokenProvider, useCase, user } = await makeSut();

    const output = await useCase.execute({ email: " ANA@bora.app ", password: "Strong@123" });

    expect(tokenProvider.generatedPayloads).toEqual([{ sub: user.id, email: "ana@bora.app" }]);
    expect(output.token).toBe(`fake-token:${user.id}:ana@bora.app`);
    expect(output.user).toEqual(user);
  });

  test("deve recusar e-mail inexistente com a mensagem unica", async () => {
    const { tokenProvider, useCase } = await makeSut();

    await expect(
      useCase.execute({ email: "outra@bora.app", password: "Strong@123" }),
    ).rejects.toThrow(new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE));
    expect(tokenProvider.generatedPayloads).toEqual([]);
  });

  test("deve recusar senha errada com a mesma mensagem", async () => {
    const { tokenProvider, useCase } = await makeSut();

    await expect(
      useCase.execute({ email: "ana@bora.app", password: "Errada@123" }),
    ).rejects.toThrow(new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE));
    expect(tokenProvider.generatedPayloads).toEqual([]);
  });

  test("deve tratar e-mail e senha ausentes como credenciais invalidas", async () => {
    const { useCase } = await makeSut();

    await expect(
      useCase.execute({} as { email: string; password: string }),
    ).rejects.toThrow(UnauthorizedError);
  });

  test("deve tratar senha ausente para e-mail existente como credenciais invalidas", async () => {
    const { useCase } = await makeSut();

    await expect(
      useCase.execute({ email: "ana@bora.app" } as { email: string; password: string }),
    ).rejects.toThrow(UnauthorizedError);
  });
});
