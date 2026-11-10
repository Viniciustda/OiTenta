import { UnauthorizedError } from "@oitenta/shared";
import { GetAuthenticatedUser, RegisterUser } from "../../../src";
import { FakeCryptoProvider, FakeUserRepository } from "../../mock";

describe("GetAuthenticatedUser", () => {
  test("deve devolver o usuario do id informado, sem senha", async () => {
    const userRepository = new FakeUserRepository();
    const { user } = await new RegisterUser(new FakeCryptoProvider(), userRepository).execute({
      name: "Ana Souza",
      email: "ana@bora.app",
      password: "Strong@123",
    });

    const output = await new GetAuthenticatedUser(userRepository).execute({ userId: user.id });

    expect(output.user).toEqual(user);
    expect(output.user.timezone).toBe("America/Sao_Paulo"); // C0-5
    expect(output.user).not.toHaveProperty("password");
  });

  test("deve lancar UnauthorizedError quando o usuario do token nao existe mais", async () => {
    const useCase = new GetAuthenticatedUser(new FakeUserRepository());

    await expect(
      useCase.execute({ userId: "8b0c9c7e-0000-4000-8000-000000000000" }),
    ).rejects.toThrow(UnauthorizedError);
  });
});
