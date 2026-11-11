import { describe, expect, it, vi } from "vitest";
import { ExampleActivationRepository } from "@/modules/activation/data/example-activation.repository";
import { HttpActivationRepository } from "@/modules/activation/data/http-activation.repository";
import { ExampleAuthRepository } from "@/modules/auth/data/example-auth.repository";
import { HttpAuthRepository } from "@/modules/auth/data/http-auth.repository";
import { ExampleGoalsRepository } from "@/modules/goals/data/example-goals.repository";
import { HttpGoalsRepository } from "@/modules/goals/data/http-goals.repository";
import { ExampleSchedulingRepository } from "@/modules/scheduling/data/example-scheduling.repository";
import { HttpSchedulingRepository } from "@/modules/scheduling/data/http-scheduling.repository";
import { ExampleSettingsRepository } from "@/modules/settings/data/example-settings.repository";
import { ExampleClock, SERVER_NOW, SystemClock } from "./clock";
import { createClock, createRepositories, resolveDataSource } from "./composition";

describe("composição dos repositórios", () => {
  it("NEXT_PUBLIC_DATA_SOURCE=example escolhe os dados de exemplo; qualquer outro valor (ou nenhum) escolhe http", () => {
    expect(resolveDataSource("example")).toBe("example");
    expect(resolveDataSource("http")).toBe("http");
    expect(resolveDataSource(undefined)).toBe("http");
    expect(resolveDataSource("")).toBe("http");
  });

  it("os testes rodam com a fonte example (vitest.config.ts)", () => {
    expect(resolveDataSource(process.env.NEXT_PUBLIC_DATA_SOURCE)).toBe("example");
  });

  it("example monta os repositórios de exemplo e o relógio do protótipo", () => {
    const r = createRepositories("example");
    expect(r.auth).toBeInstanceOf(ExampleAuthRepository);
    expect(r.scheduling).toBeInstanceOf(ExampleSchedulingRepository);
    expect(r.goals).toBeInstanceOf(ExampleGoalsRepository);
    expect(r.activation).toBeInstanceOf(ExampleActivationRepository);
    expect(createClock("example")).toBeInstanceOf(ExampleClock);
  });

  it("http monta os repositórios HTTP e o relógio real", () => {
    const r = createRepositories("http");
    expect(r.auth).toBeInstanceOf(HttpAuthRepository);
    expect(r.scheduling).toBeInstanceOf(HttpSchedulingRepository);
    expect(r.goals).toBeInstanceOf(HttpGoalsRepository);
    expect(r.activation).toBeInstanceOf(HttpActivationRepository);
    expect(createClock("http")).toBeInstanceOf(SystemClock);
  });

  it("o relógio real devolve o instante atual truncado no minuto, estável entre renders do mesmo minuto", () => {
    let ms = Date.UTC(2026, 10, 10, 22, 15, 7, 123);
    const c = new SystemClock(() => ms, () => true);
    expect(c.now()).toBe("2026-11-10T22:15:00.000Z");
    ms += 20_000;
    expect(c.now()).toBe("2026-11-10T22:15:00.000Z");
    ms += 40_000;
    expect(c.now()).toBe("2026-11-10T22:16:00.000Z");
  });

  it("no servidor (prerender) o relógio real não lê a hora e devolve o marcador fixo", () => {
    const read = vi.fn(() => 0);
    expect(new SystemClock(read, () => false).now()).toBe(SERVER_NOW);
    expect(read).not.toHaveBeenCalled();
  });

  it("o relógio real padrão usa a hora do sistema no navegador", () => {
    const before = Math.floor(Date.now() / 60_000) * 60_000;
    expect(new Date(new SystemClock().now()).getTime()).toBeGreaterThanOrEqual(before);
  });
});

describe("composição: preferências (W26)", () => {
  it("settings usa o repositório de exemplo nas duas fontes: o contrato não tem tema nem e-mail diário", () => {
    expect(createRepositories("example").settings).toBeInstanceOf(ExampleSettingsRepository);
    expect(createRepositories("http").settings).toBeInstanceOf(ExampleSettingsRepository);
  });
});
