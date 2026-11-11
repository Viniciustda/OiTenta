import { afterEach, describe, expect, it, vi } from "vitest";
import { callOf, MemoryTokenStore, stubFetch } from "@/modules/core/data/fetch-mock";
import { HttpClient } from "@/modules/core/data/http-client";
import { HttpSchedulingRepository } from "./http-scheduling.repository";

const availability = { windows: [{ weekday: 0, startMinute: 1140, endMinute: 1380 }], dailyLimitMinutes: 180 };
const plan = { totalMinutes: 0, days: 0, goals: [] };
const block = {
  id: "b1", start: "2026-11-10T22:00:00.000Z", end: "2026-11-10T23:00:00.000Z", status: "planned",
  goalId: "g1", goalTitle: "TCC", colorIndex: 1, stepId: "s1", stepTitle: "Ler",
};
const day = (date: string) => ({ date, blocks: [block], usedMinutes: 60, limitMinutes: 180 });

const setup = () => {
  const onUnauthorized = vi.fn();
  const repo = new HttpSchedulingRepository(new HttpClient({ baseUrl: "http://api.test", tokens: new MemoryTokenStore("tok"), onUnauthorized }));
  return { repo, onUnauthorized };
};

afterEach(() => vi.unstubAllGlobals());

describe("HttpSchedulingRepository", () => {
  it("setAvailability faz PUT /scheduling/availability com Bearer e devolve { availability, plan }", async () => {
    const fetch = stubFetch({ status: 200, body: { availability, plan } });
    expect(await setup().repo.setAvailability(availability)).toEqual({ availability, plan });
    const call = callOf(fetch);
    expect(call.method).toBe("PUT");
    expect(call.url.pathname).toBe("/scheduling/availability");
    expect(call.body).toEqual(availability);
    expect(call.headers.get("Authorization")).toBe("Bearer tok");
  });

  it("setAvailability com regra violada lança 422 com details", async () => {
    stubFetch({ status: 422, body: { statusCode: 422, error: "ValidationException", message: "Dados inválidos.", details: ["availability.dailyLimit.invalid"] } });
    await expect(setup().repo.setAvailability({ ...availability, dailyLimitMinutes: 25 })).rejects.toMatchObject({
      statusCode: 422, details: ["availability.dailyLimit.invalid"],
    });
  });

  it("getAvailability faz GET /scheduling/availability", async () => {
    const fetch = stubFetch({ status: 200, body: { availability } });
    expect(await setup().repo.getAvailability()).toEqual({ availability });
    const call = callOf(fetch);
    expect(call.method).toBe("GET");
    expect(call.url.pathname).toBe("/scheduling/availability");
  });

  it("getAvailability sem onboarding lança 404 (sem redirecionar)", async () => {
    stubFetch({ status: 404, body: { statusCode: 404, error: "NotFoundError", message: "Disponibilidade não encontrada" } });
    const { repo, onUnauthorized } = setup();
    await expect(repo.getAvailability()).rejects.toMatchObject({ statusCode: 404 });
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it("getDayPlan faz GET /scheduling/plan/day?date=", async () => {
    const fetch = stubFetch({ status: 200, body: day("2026-11-10") });
    expect(await setup().repo.getDayPlan("2026-11-10")).toEqual(day("2026-11-10"));
    const call = callOf(fetch);
    expect(call.method).toBe("GET");
    expect(call.url.pathname).toBe("/scheduling/plan/day");
    expect(call.url.searchParams.get("date")).toBe("2026-11-10");
  });

  it("getDayPlan com data malformada lança 400", async () => {
    stubFetch({ status: 400, body: { statusCode: 400, error: "BadRequestException", message: "date must be YYYY-MM-DD" } });
    await expect(setup().repo.getDayPlan("xyz")).rejects.toMatchObject({ statusCode: 400 });
  });

  it("getWeekPlan faz GET /scheduling/plan/week?start=", async () => {
    const body = { days: Array.from({ length: 7 }, (_, i) => day(`2026-11-${String(9 + i).padStart(2, "0")}`)) };
    const fetch = stubFetch({ status: 200, body });
    expect(await setup().repo.getWeekPlan("2026-11-09")).toEqual(body);
    const call = callOf(fetch);
    expect(call.url.pathname).toBe("/scheduling/plan/week");
    expect(call.url.searchParams.get("start")).toBe("2026-11-09");
  });

  it("getWeekPlan numa quarta lança 422", async () => {
    stubFetch({ status: 422, body: { statusCode: 422, error: "ValidationException", message: "Dados inválidos.", details: ["week.start.monday"] } });
    await expect(setup().repo.getWeekPlan("2026-11-11")).rejects.toMatchObject({ statusCode: 422 });
  });

  it("401 limpa a sessão e redireciona", async () => {
    stubFetch({ status: 401, body: { statusCode: 401, error: "UnauthorizedException", message: "Unauthorized" } });
    const { repo, onUnauthorized } = setup();
    await expect(repo.getDayPlan("2026-11-10")).rejects.toMatchObject({ statusCode: 401 });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });
});
