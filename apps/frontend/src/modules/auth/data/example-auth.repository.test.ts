import { describe, expect, it } from "vitest";
import { ApiError } from "@/modules/core/data/api-error";
import { ExampleBackend } from "@/modules/core/data/example-backend";
import { ExampleAuthRepository } from "./example-auth.repository";

describe("ExampleAuthRepository (contrato: /auth/*)", () => {
  it("demo devolve token e o usuário Arthur com fuso", async () => {
    const repo = new ExampleAuthRepository(new ExampleBackend());
    const res = await repo.demo();
    expect(res.token).toBeTruthy();
    expect(res.user).toMatchObject({ name: "Arthur", email: "arthur@faculdade.edu.br", timezone: "America/Sao_Paulo" });
  });

  it("login com a senha do usuário demo devolve token", async () => {
    const res = await new ExampleAuthRepository(new ExampleBackend()).login({ email: "arthur@faculdade.edu.br", password: "bora1234" });
    expect(res.user.name).toBe("Arthur");
  });

  it("login com senha errada responde 401", async () => {
    await expect(
      new ExampleAuthRepository(new ExampleBackend()).login({ email: "arthur@faculdade.edu.br", password: "errada" }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("cadastro devolve o usuário com o fuso padrão quando não é enviado (P1)", async () => {
    const res = await new ExampleAuthRepository(new ExampleBackend()).register({ name: "Bia", email: "bia@x.com", password: "Senha123!" });
    expect(res.user).toMatchObject({ name: "Bia", email: "bia@x.com", timezone: "America/Sao_Paulo" });
    expect(res).not.toHaveProperty("token");
  });

  it("cadastro com e-mail já existente responde 409", async () => {
    const err = await new ExampleAuthRepository(new ExampleBackend())
      .register({ name: "A", email: "arthur@faculdade.edu.br", password: "Senha123!" })
      .catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.statusCode).toBe(409);
  });

  it("me devolve o usuário da sessão depois do login", async () => {
    const repo = new ExampleAuthRepository(new ExampleBackend());
    await repo.register({ name: "Bia", email: "bia@x.com", password: "Senha123!" });
    await repo.login({ email: "bia@x.com", password: "Senha123!" });
    expect((await repo.me()).user.name).toBe("Bia");
  });
});

describe("ExampleAuthRepository sem sessão", () => {
  it("me devolve o usuário demo (dados de exemplo; o 401 real entra na Etapa D)", async () => {
    expect((await new ExampleAuthRepository(new ExampleBackend()).me()).user.name).toBe("Arthur");
  });
});
