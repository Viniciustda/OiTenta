import { describe, expect, it } from "vitest";
import type { PlanBlock } from "@/modules/scheduling/data/scheduling.types";
import { buildTimeline, daySummary, goalMeta, greeting, nextBlock, nextLine } from "./today.logic";

const TZ = "America/Sao_Paulo";
const NOW = "2026-11-16T22:40:00.000Z"; // 19:40
const block = (id: string, start: string, end: string, status: PlanBlock["status"] = "planned"): PlanBlock => ({
  id, start, end, status, goalId: "g", goalTitle: "Trabalho de Eng. Software", colorIndex: 1, stepId: "s" + id, stepTitle: "Etapa " + id,
});
const blocks = [
  block("a", "2026-11-16T23:00:00.000Z", "2026-11-17T00:30:00.000Z"),
  block("b", "2026-11-17T00:30:00.000Z", "2026-11-17T01:15:00.000Z"),
  block("c", "2026-11-17T01:15:00.000Z", "2026-11-17T02:00:00.000Z"),
];

describe("Hoje (W12)", () => {
  it("resumo do dia com etapas pendentes e o tempo planejado", () => {
    expect(daySummary(blocks)).toBe("3 etapas hoje · 3h de foco planejado. O resto da noite é seu.");
    expect(daySummary([blocks[0]])).toBe("1 etapa hoje · 1h30 de foco planejado. O resto da noite é seu.");
  });

  it("resumo quando tudo foi feito", () => {
    expect(daySummary(blocks.map((b) => ({ ...b, status: "done" as const })))).toBe("Tudo feito por hoje. Quer adiantar alguma coisa?");
  });

  it("a próxima é o primeiro bloco ainda planejado", () => {
    expect(nextBlock([{ ...blocks[0], status: "done" }, blocks[1]])?.id).toBe("b");
    expect(nextBlock([])).toBeNull();
  });

  it("linha da próxima etapa", () => {
    expect(nextLine(blocks[0], NOW, TZ)).toBe("Próxima: Etapa a · hoje às 20:00");
    expect(nextLine(null, NOW, TZ)).toBe("Nada agendado");
  });

  it("timeline: o marcador Agora antes dos blocos, cada bloco com a pílula certa", () => {
    const items = buildTimeline([{ ...blocks[0], status: "done" }, blocks[1], blocks[2]], NOW, TZ);
    expect(items.map((i) => [i.kind, i.time])).toEqual([
      ["now", "19:40"],
      ["block", "20:00"],
      ["block", "21:30"],
      ["block", "22:15"],
    ]);
    expect(items.slice(1).map((i) => (i.kind === "block" ? i.pill : ""))).toEqual(["Concluída", "Próxima · 21:30", "Hoje 22:15"]);
  });

  it("saudação do protótipo", () => {
    expect(greeting("Arthur")).toBe("Boa noite, Arthur");
  });

  it("meta da folga por objetivo", () => {
    expect(goalMeta({ deadline: "2026-11-20", slackDays: 2 })).toBe("Entrega 20/11 · folga de 2 dias");
    expect(goalMeta({ deadline: "2026-11-20", slackDays: 1 })).toBe("Entrega 20/11 · folga de 1 dia");
    expect(goalMeta({ deadline: "2026-11-20", slackDays: 0 })).toBe("Entrega 20/11 · sem folga");
    expect(goalMeta({ deadline: "2026-11-20", slackDays: -1 })).toBe("Não cabe até 20/11");
    expect(goalMeta({ deadline: null, slackDays: null })).toBe("Sem prazo");
  });
});
