import { NotFoundError } from "@oitenta/shared";
import { LoginDemoUser, RegisterUser } from "../../../src";
import { FakeCryptoProvider, FakeTokenProvider, FakeUserRepository } from "../../mock";

describe("LoginDemoUser", () => {
  test("deve devolver token do usuario de demonstracao sem exigir senha", async () => {
    const userRepository = new FakeUserRepository();
    const tokenProvider = new FakeTokenProvider();
    const { user } = await new RegisterUser(new FakeCryptoProvider(), userRepository).execute({
      name: "Usuaria Demo",
      email: "demo@bora.app",
      password: "Strong@123",
    });

    const output = await new LoginDemoUser(tokenProvider, userRepository).execute({
      demoEmail: " DEMO@bora.app ",
    });

    expect(tokenProvider.generatedPayloads).toEqual([{ sub: user.id, email: "demo@bora.app" }]);
    expect(output.token).toBe(`fake-token:${user.id}:demo@bora.app`);
    expect(output.user).toEqual(user);
  });

  test("deve lancar NotFoundError quando o seed ainda nao criou o usuario demo", async () => {
    const tokenProvider = new FakeTokenProvider();
    const useCase = new LoginDemoUser(tokenProvider, new FakeUserRepository());

    await expect(useCase.execute({ demoEmail: "demo@bora.app" })).rejects.toThrow(NotFoundError);
    expect(tokenProvider.generatedPayloads).toEqual([]);
  });
});
