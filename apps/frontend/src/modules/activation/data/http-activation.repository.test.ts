import { afterEach, describe, expect, it, vi } from "vitest";
import { callOf, MemoryTokenStore, stubFetch } from "@/modules/core/data/fetch-mock";
import { HttpClient } from "@/modules/core/data/http-client";
import { HttpActivationRepository } from "./http-activation.repository";
import type { RecordSessionInput } from "./activation.types";

const setup = () => {
  const onUnauthorized = vi.fn();
  const repo = new HttpActivationRepository(new HttpClient({ baseUrl: "http://api.test", tokens: new MemoryTokenStore("tok"), onUnauthorized }));
  return { repo, onUnauthorized };
};

const ramp = {
  suggested: "challenge",
  steps: [
    { kind: "warmup", options: [{ id: "w1", stepKind: "warmup", title: "Respire", durationLabel: "3 min", durationSeconds: 180, description: "", icon: "wind" }] },
    { kind: "challenge", options: [{ id: "c1", stepKind: "challenge", title: "Conta", durationLabel: "2 min", description: "", icon: "calculator", operation: "mix", problems: [{ a: 1, b: 2, op: "+" }] }] },
    { kind: "micro", options: [] },
    { kind: "focus", options: [] },
    { kind: "log", options: [] },
  ],
};

const session: RecordSessionInput = {
  goalId: "g1", stepId: "s1", blockId: "b1", energy: "medium", availableTime: "30m",
  startedAt: "2026-11-10T22:00:00.000Z", endedAt: "2026-11-10T22:25:00.000Z", focusedMinutes: 25, outcome: "partial", partialPct: 70,
};
const recorded = {
  session: { ...session, id: "sess-1" },
  step: { progressPct: 70, status: "pending" },
  goalProgressPct: 57,
  plan: { totalMinutes: 30, days: 1, goals: [] },
};

afterEach(() => vi.unstubAllGlobals());

describe("HttpActivationRepository", () => {
  it("getRamp faz GET /activation/ramp com goalId, stepId, energy e availableTime; devolve stepKind e operation", async () => {
    const fetch = stubFetch({ status: 200, body: ramp });
    const res = await setup().repo.getRamp({ goalId: "g1", stepId: "s1", energy: "medium", availableTime: "30m" });
    expect(res).toEqual(ramp);
    expect(res.steps[1].options[0]).toMatchObject({ stepKind: "challenge", operation: "mix" });
    const call = callOf(fetch);
    expect(call.method).toBe("GET");
    expect(call.url.pathname).toBe("/activation/ramp");
    expect(Object.fromEntries(call.url.searchParams)).toEqual({ goalId: "g1", stepId: "s1", energy: "medium", availableTime: "30m" });
    expect(call.headers.get("Authorization")).toBe("Bearer tok");
  });

  it("getRamp sem availableTime não envia o parâmetro", async () => {
    const fetch = stubFetch({ status: 200, body: ramp });
    await setup().repo.getRamp({ goalId: "g1", stepId: "s1", energy: "low", availableTime: null });
    expect(callOf(fetch).url.searchParams.has("availableTime")).toBe(false);
  });

  it("getRamp com energia inválida lança 400", async () => {
    stubFetch({ status: 400, body: { statusCode: 400, error: "BadRequestException", message: "energy must be one of" } });
    await expect(setup().repo.getRamp({ goalId: "g1", stepId: "s1", energy: "xyz" as never })).rejects.toMatchObject({ statusCode: 400 });
  });

  it("getRamp de etapa de outro usuário lança 404", async () => {
    stubFetch({ status: 404, body: { statusCode: 404, error: "NotFoundError", message: "Etapa não encontrada" } });
    await expect(setup().repo.getRamp({ goalId: "g1", stepId: "s-b", energy: "low" })).rejects.toMatchObject({ statusCode: 404 });
  });

  it("recordSession faz POST /activation/sessions com o corpo e devolve o resultado", async () => {
    const fetch = stubFetch({ status: 201, body: recorded });
    expect(await setup().repo.recordSession(session)).toEqual(recorded);
    const call = callOf(fetch);
    expect(call.method).toBe("POST");
    expect(call.url.pathname).toBe("/activation/sessions");
    expect(call.body).toEqual(session);
  });

  it("recordSession sem bloco não envia blockId (opcional no corpo)", async () => {
    const fetch = stubFetch({ status: 201, body: recorded });
    await setup().repo.recordSession({ ...session, blockId: null });
    expect(callOf(fetch).body).not.toHaveProperty("blockId");
  });

  it("recordSession partial sem % lança 422", async () => {
    stubFetch({ status: 422, body: { statusCode: 422, error: "ValidationException", message: "Dados inválidos.", details: ["session.partialPct.required"] } });
    await expect(setup().repo.recordSession({ ...session, partialPct: null })).rejects.toMatchObject({
      statusCode: 422, details: ["session.partialPct.required"],
    });
  });

  it("401 redireciona", async () => {
    stubFetch({ status: 401, body: { statusCode: 401, error: "UnauthorizedException", message: "Unauthorized" } });
    const { repo, onUnauthorized } = setup();
    await expect(repo.recordSession(session)).rejects.toMatchObject({ statusCode: 401 });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });
});
