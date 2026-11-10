import { describe, expect, it } from "vitest";
import { ENERGY_CHIPS, energyBrotoMood, energyForRamp, energyMessage, heroSubtitle } from "./energy.logic";

describe("check-in de energia do Hoje (W12–W14 + P14)", () => {
  it("tem 4 chips: Baixa, Média, Alta e Elétrico (P14)", () => {
    expect(ENERGY_CHIPS.map((c) => [c.level, c.label])).toEqual([
      ["low", "Baixa"],
      ["medium", "Média"],
      ["high", "Alta"],
      ["electric", "Elétrico"],
    ]);
  });

  it("sem energia escolhida pede o check-in", () => {
    expect(energyMessage(null)).toBe("Conta pra mim antes de começar.");
    expect(heroSubtitle(null)).toBe("Rampa de 25 min até o foco");
  });

  it("energia baixa: rampa leve (texto do protótipo)", () => {
    expect(energyMessage("low")).toBe("Rampa leve hoje, aquecimento mais longo. Tarefas leves à mão.");
    expect(heroSubtitle("low")).toBe("Rampa leve até o foco");
  });

  it("energia alta segue a tabela do P14 (micro-passo), não o protótipo web", () => {
    expect(energyMessage("high")).toBe("Bora! Pulo direto pro micro-passo.");
    expect(heroSubtitle("high")).toBe("Direto pro micro-passo · 25 min de foco");
  });

  it("elétrico vai direto pro foco (P14)", () => {
    expect(energyMessage("electric")).toBe("Bora! Direto pro foco.");
    expect(heroSubtitle("electric")).toBe("Direto pro foco · 25 min de foco");
  });

  it("humor do Broto acompanha a energia", () => {
    expect(energyBrotoMood("low")).toBe("sonolento");
    expect(energyBrotoMood("medium")).toBe("ok");
    expect(energyBrotoMood("high")).toBe("animado");
    expect(energyBrotoMood("electric")).toBe("animado");
    expect(energyBrotoMood(null)).toBe("ok");
  });

  it("sem check-in, a rampa usa energia baixa (começa no Aquecer, como no protótipo)", () => {
    expect(energyForRamp(null)).toBe("low");
    expect(energyForRamp("high")).toBe("high");
  });
});
