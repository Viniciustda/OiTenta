import { ConflictError, ValidationException } from "@oitenta/shared";
import { RegisterUser, User } from "../../../src";
import { FakeCryptoProvider, FakeUserRepository } from "../../mock";

function makeSut(users: User[] = []) {
  const cryptoProvider = new FakeCryptoProvider();
  const userRepository = new FakeUserRepository(users);
  const useCase = new RegisterUser(cryptoProvider, userRepository);
  return { cryptoProvider, userRepository, useCase };
}

describe("RegisterUser", () => {
  test("deve criptografar a senha, validar e persistir o usuario", async () => {
    const { cryptoProvider, userRepository, useCase } = makeSut();
    const validateSpy = jest.spyOn(User.prototype, "validate");

    const output = await useCase.execute({
      name: "Ana Souza",
      email: "  Ana@Bora.App ",
      password: "Strong@123",
    });

    expect(cryptoProvider.encryptedPasswords).toEqual(["Strong@123"]);
    expect(validateSpy).toHaveBeenCalledTimes(1);
    expect(userRepository.users).toHaveLength(1);
    expect(userRepository.users[0].password).not.toBe("Strong@123");
    expect(output.user).toEqual({
      id: userRepository.users[0].id,
      name: "Ana Souza",
      email: "ana@bora.app",
    });
    expect(output.user).not.toHaveProperty("password");

    validateSpy.mockRestore();
  });

  test("deve rejeitar senha fraca antes de qualquer efeito colateral", async () => {
    const { cryptoProvider, userRepository, useCase } = makeSut();

    await expect(
      useCase.execute({ name: "Ana Souza", email: "ana@bora.app", password: "123456" }),
    ).rejects.toThrow(ValidationException);

    expect(cryptoProvider.encryptedPasswords).toEqual([]);
    expect(userRepository.users).toEqual([]);
  });

  test("deve lancar ConflictError quando o e-mail ja existe, sem criptografar", async () => {
    const { useCase: first, userRepository, cryptoProvider } = makeSut();
    await first.execute({ name: "Ana Souza", email: "ana@bora.app", password: "Strong@123" });
    const useCase = new RegisterUser(cryptoProvider, userRepository);

    await expect(
      useCase.execute({ name: "Ana Lima", email: "ANA@bora.app", password: "Strong@456" }),
    ).rejects.toThrow(ConflictError);

    expect(cryptoProvider.encryptedPasswords).toEqual(["Strong@123"]);
    expect(userRepository.users).toHaveLength(1);
  });

  test("deve propagar erro de validacao da entidade sem persistir", async () => {
    const { userRepository, useCase } = makeSut();

    await expect(
      useCase.execute({ name: "Ana", email: "ana@bora.app", password: "Strong@123" }),
    ).rejects.toThrow(ValidationException);

    expect(userRepository.users).toEqual([]);
  });
});
