import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/modules/core/data/api-error";
import { callOf, MemoryTokenStore, stubFetch } from "@/modules/core/data/fetch-mock.test-utils";
import { HttpClient } from "@/modules/core/data/http-client";
import { HttpGoalAssistantRepository } from "./http-goal-assistant.repository";

const client = () => new HttpClient({ baseUrl: "http://api.test", tokens: new MemoryTokenStore("tok"), onUnauthorized: vi.fn() });
const setup = (timeoutMs?: number) => new HttpGoalAssistantRepository(client(), timeoutMs);

const draft = {
  title: "Trabalho de Algoritmos",
  deadline: "2026-11-24",
  category: "assignment",
  requirements: [],
  missingFields: [],
  steps: [
    { title: "Ler o enunciado e listar requisitos", estimatedMinutes: 30, aiEstimatedMinutes: 30, microSteps: ["Abra o enunciado e copie os itens pedidos numa lista"] },
  ],
  totalMinutes: 30,
} as const;

afterEach(() => vi.unstubAllGlobals());

describe("HttpGoalAssistantRepository — POST /goals/assistant/draft", () => {
  it("200: faz POST /goals/assistant/draft com { text } e o token, e devolve { draft, engine }", async () => {
    const body = { draft, engine: "rules" };
    const fetch = stubFetch({ status: 200, body });
    expect(await setup().draft("Trabalho de Algoritmos, entrega 24/11")).toEqual(body);
    const call = callOf(fetch);
    expect(call.method).toBe("POST");
    expect(call.url.pathname).toBe("/goals/assistant/draft");
    expect(call.body).toEqual({ text: "Trabalho de Algoritmos, entrega 24/11" });
    expect(call.headers.get("Authorization")).toBe("Bearer tok");
  });

  it("200 sem prazo: deadline null e missingFields ['deadline'] (IA2)", async () => {
    const body = { draft: { ...draft, deadline: null, missingFields: ["deadline"] }, engine: "rules" };
    stubFetch({ status: 200, body });
    const res = await setup().draft("Trabalho de Algoritmos");
    expect(res.draft.deadline).toBeNull();
    expect(res.draft.missingFields).toEqual(["deadline"]);
  });

  it("503 (IA indisponível) lança ApiError 503", async () => {
    stubFetch({ status: 503, body: { statusCode: 503, error: "ServiceUnavailableError", message: "assistant.unavailable" } });
    const err = await setup().draft("x").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ statusCode: 503 });
  });

  it("outro erro HTTP (500) também lança", async () => {
    stubFetch({ status: 500, body: "<html>oops</html>" });
    await expect(setup().draft("x")).rejects.toMatchObject({ statusCode: 500 });
  });

  it("erro de rede lança", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("Failed to fetch"); }));
    await expect(setup().draft("x")).rejects.toThrow("Failed to fetch");
  });

  it("sem resposta dentro do timeout (25 s no app, docs/7 §c.5), cancela a chamada e lança", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init?: RequestInit) =>
        new Promise<Response>((_, reject) => init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")))),
      ),
    );
    await expect(setup(20).draft("x")).rejects.toThrow("aborted");
  });

  it("o timeout padrão é de 25 s", () => {
    expect(HttpGoalAssistantRepository.TIMEOUT_MS).toBe(25_000);
  });
});
