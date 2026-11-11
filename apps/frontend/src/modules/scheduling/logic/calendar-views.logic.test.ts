import { describe, expect, it } from "vitest";
import type { GoalListItem, GoalStepDetail } from "@/modules/goals/data";
import {
  canNavigate,
  deadlineCountLabel,
  deadlineDetail,
  deadlinesOn,
  dayFromWeek,
  inHorizon,
  monthCellOpacity,
  monthCellSummary,
  monthGridDates,
  mondayOf,
  prazosEmptyLabel,
  rangeLabel,
  shiftAnchor,
  verExecucaoWeek,
  viewDates,
  weekStarts,
} from "./calendar.logic";

const TZ = "America/Sao_Paulo";
const TODAY = "2026-11-16";

const goal = (over: Partial<GoalListItem>): GoalListItem => ({
  id: "g",
  title: "Objetivo",
  deadline: null,
  colorIndex: 1,
  progressPct: 0,
  done: 0,
  total: 1,
  status: "active",
  slackDays: null,
  createdAt: "2026-11-09T12:00:00.000Z",
  ...over,
});

const ENG = goal({ id: "eng", title: "Trabalho de Eng. Software", deadline: "2026-11-20", progressPct: 62, done: 4, total: 7, slackDays: 2 });
const CALC = goal({ id: "calc", title: "Prova de Cálculo II", deadline: "2026-11-27", colorIndex: 2, progressPct: 25 });
const SEM_PRAZO = goal({ id: "livro", title: "Ler um livro", deadline: null });

describe("calendário: datas de cada visualização (W15, W19, W20)", () => {
  it("segunda-feira da semana de uma data", () => {
    expect(mondayOf("2026-11-16")).toBe("2026-11-16");
    expect(mondayOf("2026-11-22")).toBe("2026-11-16");
    expect(mondayOf("2026-11-01")).toBe("2026-10-26");
  });

  it("mês: 42 dias a partir da segunda da semana do dia 1 (protótipo: 26/10 a 06/12)", () => {
    const dates = monthGridDates("2026-11-16");
    expect(dates).toHaveLength(42);
    expect(dates[0]).toBe("2026-10-26");
    expect(dates[41]).toBe("2026-12-06");
  });

  it("dia mostra 1 data, semana 7 a partir da segunda, mês 42", () => {
    expect(viewDates("dia", "2026-11-18")).toEqual(["2026-11-18"]);
    expect(viewDates("semana", "2026-11-16")).toEqual(["2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19", "2026-11-20", "2026-11-21", "2026-11-22"]);
    expect(viewDates("mes", "2026-11-16")).toHaveLength(42);
  });

  it("semanas a buscar para montar o mês (sem endpoint de mês)", () => {
    expect(weekStarts(monthGridDates("2026-11-16"))).toEqual(["2026-10-26", "2026-11-02", "2026-11-09", "2026-11-16", "2026-11-23", "2026-11-30"]);
  });

  it("rótulo do período: dia, semana e mês", () => {
    expect(rangeLabel("dia", "2026-11-16")).toBe("Segunda, 16/11");
    expect(rangeLabel("semana", "2026-11-16")).toBe("16–22 de novembro");
    expect(rangeLabel("mes", "2026-11-16")).toBe("Novembro de 2026");
  });
});

describe("calendário: navegação (protótipo: 4 semanas a partir de hoje, mês fixo)", () => {
  it("semana: não volta antes da semana atual nem passa de 3 semanas à frente", () => {
    expect(canNavigate("semana", "2026-11-16", TODAY, -1)).toBe(false);
    expect(canNavigate("semana", "2026-11-16", TODAY, 1)).toBe(true);
    expect(canNavigate("semana", "2026-12-07", TODAY, 1)).toBe(false);
    expect(shiftAnchor("semana", "2026-11-16", 1)).toBe("2026-11-23");
  });

  it("dia: de hoje a hoje + 27", () => {
    expect(canNavigate("dia", TODAY, TODAY, -1)).toBe(false);
    expect(canNavigate("dia", "2026-12-13", TODAY, 1)).toBe(false);
    expect(canNavigate("dia", "2026-11-17", TODAY, -1)).toBe(true);
    expect(shiftAnchor("dia", "2026-11-17", -1)).toBe(TODAY);
  });

  it("mês: setas desligadas", () => {
    expect(canNavigate("mes", TODAY, TODAY, -1)).toBe(false);
    expect(canNavigate("mes", TODAY, TODAY, 1)).toBe(false);
  });

  it("de Semana para Dia: hoje, se a semana é a atual; senão a segunda da semana", () => {
    expect(dayFromWeek("2026-11-16", "2026-11-18")).toBe("2026-11-18");
    expect(dayFromWeek("2026-11-23", "2026-11-18")).toBe("2026-11-23");
  });

  it("clicar num dia do mês só abre o Dia dentro do horizonte", () => {
    expect(inHorizon("2026-11-15", TODAY)).toBe(false);
    expect(inHorizon(TODAY, TODAY)).toBe(true);
    expect(inHorizon("2026-12-13", TODAY)).toBe(true);
    expect(inHorizon("2026-12-14", TODAY)).toBe(false);
  });
});

describe("calendário Prazos (W17, W18)", () => {
  it("1 item por objetivo, na data do prazo; sem prazo e filtrado não aparecem", () => {
    const goals = [ENG, CALC, SEM_PRAZO];
    expect(deadlinesOn(goals, "2026-11-20", {}).map((g) => g.id)).toEqual(["eng"]);
    expect(deadlinesOn(goals, "2026-11-20", { eng: true })).toEqual([]);
    expect(monthGridDates(TODAY).flatMap((d) => deadlinesOn(goals, d, {})).map((g) => g.id)).toEqual(["eng", "calc"]);
  });

  it("objetivo concluído continua em Prazos (protótipo não filtra)", () => {
    expect(deadlinesOn([{ ...ENG, status: "done" }], "2026-11-20", {})).toHaveLength(1);
  });

  it("contagem no cabeçalho do dia", () => {
    expect(deadlineCountLabel(0)).toBe("—");
    expect(deadlineCountLabel(1)).toBe("1 entrega");
    expect(deadlineCountLabel(2)).toBe("2 entregas");
  });

  it("aviso sem entregas, com a próxima depois do período", () => {
    expect(prazosEmptyLabel("dia", [ENG, CALC], TODAY, {})).toBe("Nenhuma entrega neste dia · próxima: Trabalho de Eng. Software em 20/11");
    expect(prazosEmptyLabel("semana", [ENG, CALC], "2026-11-29", {})).toBe("Nenhuma entrega nesta semana");
    expect(prazosEmptyLabel("semana", [ENG, CALC], "2026-11-22", { calc: true })).toBe("Nenhuma entrega nesta semana");
  });

  it("detalhe do prazo", () => {
    const steps: GoalStepDetail[] = [
      { id: "s5", order: 5, title: "Diagrama de casos de uso", estimatedMinutes: 90, progressPct: 0, status: "pending", remainingMinutes: 90, nextBlock: { id: "b5", start: "2026-11-16T23:00:00.000Z", end: "2026-11-17T00:30:00.000Z" } },
      { id: "s6", order: 6, title: "Revisar documento", estimatedMinutes: 60, progressPct: 0, status: "pending", remainingMinutes: 60, nextBlock: { id: "b6", start: "2026-11-17T23:00:00.000Z", end: "2026-11-18T00:00:00.000Z" } },
      { id: "s1", order: 1, title: "Definir escopo", estimatedMinutes: 45, progressPct: 100, status: "done", remainingMinutes: 0 },
    ];
    expect(deadlineDetail(ENG, steps, TODAY, TZ)).toEqual({
      when: "Entrega · Sexta, 20/11 · em 4 dias",
      etapas: "4 de 7 etapas concluídas",
      restante: "Faltam 2h30 de execução",
      folga: "Folga restante: 2 dias",
      late: false,
      next: "Próxima etapa: Diagrama de casos de uso · hoje às 20:00",
    });
  });

  it("detalhe do prazo: concluído, atrasado, sem folga e sem etapas agendadas", () => {
    expect(deadlineDetail({ ...ENG, status: "done", slackDays: null }, [], "2026-11-20", TZ)).toMatchObject({ when: "Entrega · Sexta, 20/11 · hoje", restante: "Nada pendente", folga: "Pronto antes do prazo", next: "Sem etapas agendadas" });
    expect(deadlineDetail({ ...ENG, slackDays: -1 }, [], "2026-11-19", TZ)).toMatchObject({ when: "Entrega · Sexta, 20/11 · amanhã", folga: "Não cabe até 20/11", late: true });
    expect(deadlineDetail({ ...ENG, slackDays: 0 }, [], TODAY, TZ).folga).toBe("Sem folga restante");
    expect(deadlineDetail({ ...ENG, slackDays: 1 }, [], TODAY, TZ).folga).toBe("Folga restante: 1 dia");
  });

  it("Ver execução: semana da próxima etapa, dentro do horizonte", () => {
    expect(verExecucaoWeek("2026-11-25T23:00:00.000Z", "2026-11-27", TODAY, TZ)).toBe("2026-11-23");
    expect(verExecucaoWeek(null, "2027-01-10", TODAY, TZ)).toBe("2026-12-07");
  });
});

describe("calendário mês (W18, W19)", () => {
  it("dias passados e de outro mês ficam apagados", () => {
    expect(monthCellOpacity("2026-11-10", "2026-11-16", TODAY)).toBe(0.45);
    expect(monthCellOpacity("2026-12-05", "2026-11-16", TODAY)).toBe(0.55);
    expect(monthCellOpacity("2026-11-20", "2026-11-16", TODAY)).toBe(1);
  });

  it("Execução: carga, até 3 etapas e \"+N\"", () => {
    const b = (id: string, start: string, end: string) => ({ id, start, end, status: "planned" as const, goalId: "g", goalTitle: "G", colorIndex: 1, stepId: id, stepTitle: id });
    const blocks = [
      b("d", "2026-11-19T01:30:00.000Z", "2026-11-19T02:00:00.000Z"),
      b("a", "2026-11-18T23:00:00.000Z", "2026-11-18T23:30:00.000Z"),
      b("b", "2026-11-18T23:30:00.000Z", "2026-11-19T01:00:00.000Z"),
      b("c", "2026-11-19T01:00:00.000Z", "2026-11-19T01:30:00.000Z"),
    ];
    const s = monthCellSummary(blocks);
    expect(s.load).toBe("3h");
    expect(s.bars.map((x) => x.id)).toEqual(["a", "b", "c"]);
    expect(s.more).toBe(1);
    expect(monthCellSummary([]).load).toBe("");
  });
});
