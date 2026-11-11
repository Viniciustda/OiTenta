import { describe, expect, it } from "vitest";
import type { GoalListItem, GoalStepDetail } from "../data/goals.types";
import { activeCountLabel, goalCardView } from "./goal-list.logic";

const TZ = "America/Sao_Paulo";
const TODAY = "2026-11-16";

const item = (over: Partial<GoalListItem> = {}): GoalListItem => ({
  id: "g1",
  title: "Trabalho de Eng. Software",
  deadline: "2026-11-20",
  colorIndex: 1,
  progressPct: 62,
  done: 4,
  total: 7,
  status: "active",
  slackDays: 2,
  createdAt: "2026-11-01T12:00:00.000Z",
  ...over,
});

const step = (over: Partial<GoalStepDetail> = {}): GoalStepDetail => ({
  id: "s1",
  order: 1,
  title: "Diagrama de casos de uso",
  estimatedMinutes: 90,
  progressPct: 0,
  status: "pending",
  remainingMinutes: 90,
  ...over,
});

// 20:00 e 21:30 de 16/11 em São Paulo (UTC−3).
const at2000 = { id: "b1", start: "2026-11-16T23:00:00.000Z", end: "2026-11-17T00:30:00.000Z" };
const at2130Tomorrow = { id: "b2", start: "2026-11-18T00:30:00.000Z", end: "2026-11-18T01:15:00.000Z" };

describe("W21 lista de objetivos", () => {
  it("prazo, próxima etapa e folga do objetivo", () => {
    const v = goalCardView(item(), [step({ id: "s0", status: "done" }), step({ nextBlock: at2000 })], TODAY, TZ);
    expect(v.kindLabel).toBe("Entrega · 20/11");
    expect(v.nextLine).toBe("Próxima: Diagrama de casos de uso · hoje às 20:00");
    expect(v.folgaLine).toBe("Folga de 2 dias");
    expect(v.late).toBe(false);
  });

  it("a próxima é o bloco planejado mais cedo entre as etapas pendentes", () => {
    const v = goalCardView(
      item(),
      [step({ id: "a", title: "Depois", nextBlock: at2130Tomorrow }), step({ id: "b", title: "Antes", nextBlock: at2000 })],
      TODAY,
      TZ,
    );
    expect(v.nextLine).toBe("Próxima: Antes · hoje às 20:00");
    const later = goalCardView(item(), [step({ title: "Lista", nextBlock: at2130Tomorrow })], TODAY, TZ);
    expect(later.nextLine).toBe("Próxima: Lista · amanhã às 21:30");
  });

  it("sem bloco: 'Sem etapas agendadas'; objetivo concluído: 'Tudo pronto' e 'Entregue com folga'", () => {
    expect(goalCardView(item(), [step()], TODAY, TZ).nextLine).toBe("Sem etapas agendadas");
    const done = goalCardView(item({ status: "done", slackDays: null, progressPct: 100 }), [step({ status: "done" })], TODAY, TZ);
    expect(done.nextLine).toBe("Tudo pronto");
    expect(done.folgaLine).toBe("Entregue com folga");
  });

  it("folga negativa: não cabe até o prazo, em alerta", () => {
    const v = goalCardView(item({ slackDays: -1 }), [], TODAY, TZ);
    expect(v.folgaLine).toBe("Não cabe até 20/11");
    expect(v.late).toBe(true);
  });

  it("folga de 1 dia, sem folga e sem prazo", () => {
    expect(goalCardView(item({ slackDays: 1 }), [], TODAY, TZ).folgaLine).toBe("Folga de 1 dia");
    expect(goalCardView(item({ slackDays: 0 }), [], TODAY, TZ).folgaLine).toBe("Sem folga");
    const noDeadline = goalCardView(item({ deadline: null, slackDays: null }), [], TODAY, TZ);
    expect(noDeadline.kindLabel).toBe("Sem prazo");
    expect(noDeadline.folgaLine).toBe("Sem prazo");
  });

  it("contagem de ativos", () => {
    expect(activeCountLabel([item(), item({ id: "g2" }), item({ id: "g3", status: "done" })])).toBe("2 ativos");
    expect(activeCountLabel([item()])).toBe("1 ativo");
  });
});
