import { describe, expect, it } from "vitest";
import { ExampleSettingsRepository } from "./example-settings.repository";

// Sem endpoint no contrato (docs/4-contrato-api.md): tema e e-mail diário ficam só nos dados de exemplo.
describe("preferências de exemplo (W26)", () => {
  it("começa como o protótipo: tema claro e e-mail diário ligado", async () => {
    expect(await new ExampleSettingsRepository().getPreferences()).toEqual({ theme: "light", dailyEmail: true });
  });

  it("guarda o tema e o e-mail diário", async () => {
    const repo = new ExampleSettingsRepository();
    expect(await repo.setTheme("dark")).toEqual({ theme: "dark", dailyEmail: true });
    expect(await repo.setDailyEmail(false)).toEqual({ theme: "dark", dailyEmail: false });
    expect(await repo.getPreferences()).toEqual({ theme: "dark", dailyEmail: false });
  });

  it("devolve cópias: mexer no retorno não muda o guardado", async () => {
    const repo = new ExampleSettingsRepository();
    const p = await repo.getPreferences();
    p.theme = "dark";
    expect((await repo.getPreferences()).theme).toBe("light");
  });
});
