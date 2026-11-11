import { afterEach, describe, expect, it, vi } from "vitest";
import { callOf, MemoryTokenStore, stubFetch } from "@/modules/core/data/fetch-mock.test-utils";
import { HttpClient } from "@/modules/core/data/http-client";
import { HttpGoalsRepository } from "./http-goals.repository";
import type { CreateGoalInput } from "./goals.types";

const setup = () => {
  const onUnauthorized = vi.fn();
  const repo = new HttpGoalsRepository(new HttpClient({ baseUrl: "http://api.test", tokens: new MemoryTokenStore("tok"), onUnauthorized }));
  return { repo, onUnauthorized };
};

const goal = { id: "g1", title: "TCC", deadline: "2026-11-24", kind: "goal", colorIndex: 1, progressPct: 0, status: "active" } as const;

afterEach(() => vi.unstubAllGlobals());

describe("HttpGoalsRepository", () => {
  it("create faz POST /goals com o corpo e devolve { goal, plan }", async () => {
    const input: CreateGoalInput = { title: "TCC", deadline: "2026-11-24", kind: "goal", steps: [{ title: "Ler", estimatedMinutes: 30, microSteps: [] }] };
    const body = {
      goal: { ...goal, steps: [{ id: "s1", order: 1, title: "Ler", estimatedMinutes: 30, progressPct: 0, status: "pending", microSteps: [] }] },
      plan: { totalMinutes: 30, days: 1, goals: [{ goalId: "g1", feasible: true, usedSlack: false, slackDays: 3, unscheduledMinutes: 0 }] },
    };
    const fetch = stubFetch({ status: 201, body });
    expect(await setup().repo.create(input)).toEqual(body);
    const call = callOf(fetch);
    expect(call.method).toBe("POST");
    expect(call.url.pathname).toBe("/goals");
    expect(call.body).toEqual(input);
    expect(call.headers.get("Authorization")).toBe("Bearer tok");
  });

  it("create com zero etapas lança 422 com details", async () => {
    stubFetch({ status: 422, body: { statusCode: 422, error: "ValidationException", message: "Dados inválidos.", details: ["goal.steps.required"] } });
    await expect(setup().repo.create({ title: "x", deadline: null, kind: "goal", steps: [] })).rejects.toMatchObject({
      statusCode: 422, details: ["goal.steps.required"],
    });
  });

  it("create sem disponibilidade lança 404", async () => {
    stubFetch({ status: 404, body: { statusCode: 404, error: "NotFoundError", message: "Faça o onboarding" } });
    await expect(setup().repo.create({ title: "x", deadline: null, kind: "single", steps: [] })).rejects.toMatchObject({ statusCode: 404 });
  });

  it("list faz GET /goals e devolve createdAt e slackDays null para objetivo done", async () => {
    const body = {
      goals: [
        { id: "g1", title: "TCC", deadline: "2026-11-24", colorIndex: 1, progressPct: 40, done: 2, total: 5, status: "active", slackDays: 2, createdAt: "2026-11-01T12:00:00.000Z" },
        { id: "g2", title: "Prova", deadline: null, colorIndex: 2, progressPct: 100, done: 3, total: 3, status: "done", slackDays: null, createdAt: "2026-11-02T12:00:00.000Z" },
      ],
    };
    const fetch = stubFetch({ status: 200, body });
    const res = await setup().repo.list();
    expect(res).toEqual(body);
    expect(res.goals[1].slackDays).toBeNull();
    const call = callOf(fetch);
    expect(call.method).toBe("GET");
    expect(call.url.pathname).toBe("/goals");
  });

  it("get faz GET /goals/:goalId e devolve nextBlock das etapas pendentes", async () => {
    const header = { id: "g1", title: "TCC", deadline: "2026-11-24", kind: "goal", colorIndex: 1, source: "manual", status: "active" } as const;
    const body = {
      goal: header, progressPct: 0, done: 0, total: 1,
      steps: [{
        id: "s1", order: 1, title: "Ler", estimatedMinutes: 30, progressPct: 0, status: "pending", remainingMinutes: 30,
        nextBlock: { id: "b1", start: "2026-11-10T22:00:00.000Z", end: "2026-11-10T22:30:00.000Z" },
      }],
    };
    const fetch = stubFetch({ status: 200, body });
    const res = await setup().repo.get("g 1");
    expect(res.steps[0].nextBlock).toEqual(body.steps[0].nextBlock);
    expect(res.goal).toEqual(header);
    expect(res.goal).not.toHaveProperty("progressPct");
    const call = callOf(fetch);
    expect(call.method).toBe("GET");
    expect(call.url.pathname).toBe("/goals/g%201");
  });

  it("get de objetivo de outro usuário lança 404", async () => {
    stubFetch({ status: 404, body: { statusCode: 404, error: "NotFoundError", message: "Objetivo não encontrado" } });
    await expect(setup().repo.get("g-outro")).rejects.toMatchObject({ statusCode: 404, message: "Objetivo não encontrado" });
  });

  it("401 redireciona", async () => {
    stubFetch({ status: 401, body: { statusCode: 401, error: "UnauthorizedException", message: "Unauthorized" } });
    const { repo, onUnauthorized } = setup();
    await expect(repo.list()).rejects.toMatchObject({ statusCode: 401 });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });
});
