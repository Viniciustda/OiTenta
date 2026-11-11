import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "./api-error";
import { callOf, MemoryTokenStore, stubFetch } from "./fetch-mock.test-utils";
import { API_URL, HttpClient, LocalStorageTokenStore, TOKEN_KEY } from "./http-client";

const setup = (token: string | null = "tok-1") => {
  const tokens = new MemoryTokenStore(token);
  const onUnauthorized = vi.fn();
  const client = new HttpClient({ baseUrl: "http://api.test", tokens, onUnauthorized });
  return { tokens, onUnauthorized, client };
};

afterEach(() => vi.unstubAllGlobals());

describe("HttpClient", () => {
  it("a base padrão é http://localhost:4000 quando NEXT_PUBLIC_API_URL não existe", () => {
    expect(API_URL).toBe("http://localhost:4000");
  });

  it("monta a URL com a base, o caminho e a query, ignorando valores vazios", async () => {
    const fetch = stubFetch({ status: 200, body: { ok: true } });
    await setup().client.get("/x/y", { a: "1", b: null, c: undefined, d: "a b" });
    const { url, method } = callOf(fetch);
    expect(method).toBe("GET");
    expect(`${url.origin}${url.pathname}`).toBe("http://api.test/x/y");
    expect(Object.fromEntries(url.searchParams)).toEqual({ a: "1", d: "a b" });
  });

  it("rota autenticada envia Authorization: Bearer <token>", async () => {
    const fetch = stubFetch({ status: 200, body: {} });
    await setup("tok-1").client.get("/auth/me");
    expect(callOf(fetch).headers.get("Authorization")).toBe("Bearer tok-1");
  });

  it("rota pública não envia Authorization, mesmo com token guardado", async () => {
    const fetch = stubFetch({ status: 200, body: {} });
    await setup("tok-1").client.post("/auth/login", { a: 1 }, { auth: false });
    expect(callOf(fetch).headers.has("Authorization")).toBe(false);
  });

  it("envia o corpo em JSON com Content-Type", async () => {
    const fetch = stubFetch({ status: 201, body: {} });
    await setup().client.put("/r", { a: 1 });
    const call = callOf(fetch);
    expect(call.method).toBe("PUT");
    expect(call.headers.get("Content-Type")).toBe("application/json");
    expect(call.body).toEqual({ a: 1 });
  });

  it("devolve o JSON da resposta", async () => {
    stubFetch({ status: 200, body: { user: { id: "u1" } } });
    expect(await setup().client.get("/auth/me")).toEqual({ user: { id: "u1" } });
  });

  it.each([400, 404, 409])("converte o corpo de erro %s num ApiError com status, error e message", async (status) => {
    stubFetch({ status, body: { statusCode: status, error: "NotFoundError", message: "Não achei", path: "/r", timestamp: "t" } });
    const err = await setup().client.get("/r").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ statusCode: status, error: "NotFoundError", message: "Não achei" });
  });

  it("422 traz os details do corpo", async () => {
    stubFetch({ status: 422, body: { statusCode: 422, error: "ValidationException", message: "Dados inválidos.", details: ["goal.title.required"] } });
    const err = await setup().client.post("/goals", {}).catch((e) => e);
    expect(err).toMatchObject({ statusCode: 422, message: "Dados inválidos.", details: ["goal.title.required"] });
  });

  it("erro sem corpo JSON vira ApiError com o status da resposta e mensagem padrão", async () => {
    stubFetch({ status: 500, body: "<html>oops</html>" });
    const err = await setup().client.get("/r").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ statusCode: 500, message: "Algo deu errado. Tenta de novo." });
  });

  it("401 em rota autenticada limpa o token, chama o callback de redirecionamento e lança ApiError 401", async () => {
    stubFetch({ status: 401, body: { statusCode: 401, error: "UnauthorizedException", message: "Unauthorized" } });
    const { client, tokens, onUnauthorized } = setup("tok-1");
    const err = await client.get("/auth/me").catch((e) => e);
    expect(err).toMatchObject({ statusCode: 401 });
    expect(tokens.get()).toBeNull();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("401 em rota pública (senha errada) não limpa o token nem redireciona", async () => {
    stubFetch({ status: 401, body: { statusCode: 401, error: "UnauthorizedError", message: "E-mail ou senha inválidos" } });
    const { client, tokens, onUnauthorized } = setup("tok-1");
    const err = await client.post("/auth/login", {}, { auth: false }).catch((e) => e);
    expect(err).toMatchObject({ statusCode: 401, message: "E-mail ou senha inválidos" });
    expect(tokens.get()).toBe("tok-1");
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it("resposta sem corpo devolve undefined", async () => {
    stubFetch({ status: 204 });
    expect(await setup().client.post("/r", {})).toBeUndefined();
  });
});

describe("LocalStorageTokenStore", () => {
  it("guarda, lê e limpa o token na chave bora.token", () => {
    const data = new Map<string, string>();
    const localStorage = {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
      removeItem: (k: string) => void data.delete(k),
    };
    const store = new LocalStorageTokenStore(() => localStorage);
    expect(TOKEN_KEY).toBe("bora.token");
    expect(store.get()).toBeNull();
    store.set("abc");
    expect(localStorage.getItem("bora.token")).toBe("abc");
    expect(store.get()).toBe("abc");
    store.clear();
    expect(localStorage.getItem("bora.token")).toBeNull();
  });

  it("sem storage disponível (servidor), não há token e gravar não quebra", () => {
    const store = new LocalStorageTokenStore(() => null);
    store.set("abc");
    expect(store.get()).toBeNull();
    expect(() => store.clear()).not.toThrow();
  });
});
