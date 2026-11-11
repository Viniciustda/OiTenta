import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/modules/core/data/api-error";
import { callOf, MemoryTokenStore, stubFetch } from "@/modules/core/data/fetch-mock";
import { HttpClient } from "@/modules/core/data/http-client";
import { HttpAuthRepository } from "./http-auth.repository";

const user = { id: "u1", name: "Arthur", email: "arthur@faculdade.edu.br", timezone: "America/Sao_Paulo" };

const setup = (token: string | null = null) => {
  const tokens = new MemoryTokenStore(token);
  const onUnauthorized = vi.fn();
  const repo = new HttpAuthRepository(new HttpClient({ baseUrl: "http://api.test", tokens, onUnauthorized }));
  return { tokens, onUnauthorized, repo };
};

afterEach(() => vi.unstubAllGlobals());

describe("HttpAuthRepository", () => {
  it("register faz POST /auth/register sem Authorization e devolve { user }", async () => {
    const fetch = stubFetch({ status: 201, body: { user } });
    const { repo, tokens } = setup("antigo");
    const input = { name: "Arthur", email: "arthur@faculdade.edu.br", password: "Senha123!", timezone: "America/Sao_Paulo" };
    expect(await repo.register(input)).toEqual({ user });
    const call = callOf(fetch);
    expect(call.method).toBe("POST");
    expect(call.url.pathname).toBe("/auth/register");
    expect(call.body).toEqual(input);
    expect(call.headers.has("Authorization")).toBe(false);
    expect(tokens.get()).toBe("antigo");
  });

  it("register com e-mail já cadastrado lança ApiError 409", async () => {
    stubFetch({ status: 409, body: { statusCode: 409, error: "ConflictError", message: "E-mail já cadastrado" } });
    const err = await setup().repo.register({ name: "A", email: "a@a.com", password: "x" }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ statusCode: 409, message: "E-mail já cadastrado" });
  });

  it("login faz POST /auth/login, guarda o token e devolve { token, user }", async () => {
    const fetch = stubFetch({ status: 200, body: { token: "tok-9", user } });
    const { repo, tokens } = setup();
    expect(await repo.login({ email: user.email, password: "bora1234" })).toEqual({ token: "tok-9", user });
    const call = callOf(fetch);
    expect(call.method).toBe("POST");
    expect(call.url.pathname).toBe("/auth/login");
    expect(call.body).toEqual({ email: user.email, password: "bora1234" });
    expect(call.headers.has("Authorization")).toBe(false);
    expect(tokens.get()).toBe("tok-9");
  });

  it("login com senha errada lança 401 e não redireciona", async () => {
    stubFetch({ status: 401, body: { statusCode: 401, error: "UnauthorizedError", message: "E-mail ou senha inválidos" } });
    const { repo, onUnauthorized } = setup();
    await expect(repo.login({ email: user.email, password: "x" })).rejects.toMatchObject({ statusCode: 401 });
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it("demo faz POST /auth/demo sem corpo e guarda o token", async () => {
    const fetch = stubFetch({ status: 200, body: { token: "tok-demo", user } });
    const { repo, tokens } = setup();
    expect(await repo.demo()).toEqual({ token: "tok-demo", user });
    const call = callOf(fetch);
    expect(call.method).toBe("POST");
    expect(call.url.pathname).toBe("/auth/demo");
    expect(call.headers.has("Authorization")).toBe(false);
    expect(tokens.get()).toBe("tok-demo");
  });

  it("demo sem seed lança 404", async () => {
    stubFetch({ status: 404, body: { statusCode: 404, error: "NotFoundError", message: "Usuário demo não encontrado" } });
    await expect(setup().repo.demo()).rejects.toMatchObject({ statusCode: 404 });
  });

  it("me faz GET /auth/me com o Bearer guardado", async () => {
    const fetch = stubFetch({ status: 200, body: { user } });
    expect(await setup("tok-1").repo.me()).toEqual({ user });
    const call = callOf(fetch);
    expect(call.method).toBe("GET");
    expect(call.url.pathname).toBe("/auth/me");
    expect(call.headers.get("Authorization")).toBe("Bearer tok-1");
  });

  it("me com token expirado limpa o token e redireciona", async () => {
    stubFetch({ status: 401, body: { statusCode: 401, error: "UnauthorizedException", message: "Unauthorized" } });
    const { repo, tokens, onUnauthorized } = setup("tok-velho");
    await expect(repo.me()).rejects.toMatchObject({ statusCode: 401 });
    expect(tokens.get()).toBeNull();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });
});
