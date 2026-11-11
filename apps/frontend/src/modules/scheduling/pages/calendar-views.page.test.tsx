import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clock } from "@/modules/core/data/clock";
import { exampleBackend } from "@/modules/core/data/example-backend";
import CalendarPage from "./calendar.page";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: push }) }));
beforeEach(() => exampleBackend.reset());
afterEach(() => { cleanup(); push.mockReset(); });

const ENG = "Trabalho de Eng. Software";
// Etapas pendentes do Eng. Software nos dados de exemplo: 3 blocos na semana de 16/11.
const ENG_STEPS = ["Diagrama de casos de uso", "Revisar documento", "Montar PDF final"];

const view = (name: "Dia" | "Semana" | "Mês") => fireEvent.click(screen.getByRole("button", { name }));
const mode = (name: "Execução" | "Prazos") => fireEvent.click(screen.getByRole("tab", { name }));
const deadlineItems = (title: string) => screen.queryAllByTitle(new RegExp(`^Entrega · ${title} · \\d+%$`));
const execBlocks = (title: string) => screen.queryAllByTitle(new RegExp(`^${title} · `));

async function open() {
  render(<CalendarPage />);
  await screen.findByText("16–22 de novembro");
}

describe("W15–W20 seletor Dia / Semana / Mês", () => {
  it("troca o período mostrado e marca o botão escolhido", async () => {
    await open();
    expect(screen.getByRole("button", { name: "Semana" }).getAttribute("aria-pressed")).toBe("true");

    view("Dia");
    expect(await screen.findByText("Segunda, 16/11")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Dia" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("3h de 3h")).toBeTruthy();

    view("Mês");
    expect(await screen.findByText("Novembro de 2026")).toBeTruthy();
    expect(screen.getByRole("group", { name: "Seg, 26/10" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "Dom, 06/12" })).toBeTruthy();

    view("Semana");
    expect(await screen.findByText("16–22 de novembro")).toBeTruthy();
  });

  it("setas e Hoje andam pelo período da visualização", async () => {
    await open();
    const prev = screen.getByRole("button", { name: "Anterior" }) as HTMLButtonElement;
    expect(prev.disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Próximo" }));
    expect(await screen.findByText("23–29 de novembro")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "Hoje" })[0]);
    expect(await screen.findByText("16–22 de novembro")).toBeTruthy();

    view("Dia");
    fireEvent.click(screen.getByRole("button", { name: "Próximo" }));
    expect(await screen.findByText("Terça, 17/11")).toBeTruthy();
  });

  it("clicar no dia da semana abre o Dia; clicar no dia do mês também", async () => {
    await open();
    fireEvent.click(screen.getByRole("button", { name: "Sex, 20/11" }));
    expect(await screen.findByText("Sexta, 20/11")).toBeTruthy();
    view("Mês");
    await screen.findByText("Novembro de 2026");
    fireEvent.click(screen.getByRole("group", { name: "Qua, 18/11" }));
    expect(await screen.findByText("Quarta, 18/11")).toBeTruthy();
  });
});

describe("W15–W20 Execução: blocos das etapas", () => {
  it("semana: um bloco por etapa alocada", async () => {
    await open();
    expect(execBlocks(ENG).map((b) => b.title.split(" · ")[1])).toEqual(ENG_STEPS);
  });

  it("dia: só os blocos do dia", async () => {
    await open();
    view("Dia");
    await screen.findByText("Segunda, 16/11");
    expect(execBlocks(ENG).map((b) => b.title.split(" · ")[1])).toEqual(["Diagrama de casos de uso"]);
    expect(execBlocks("Prova de Cálculo II")).toHaveLength(1);
  });

  it("mês: as etapas aparecem no dia, até 3 por dia e \"+N\"", async () => {
    await open();
    view("Mês");
    const wed = within(await screen.findByRole("group", { name: "Qua, 18/11" }));
    expect(wed.getByText("Montar PDF final")).toBeTruthy();
    expect(wed.getByText("+1")).toBeTruthy();
    const mon = within(screen.getByRole("group", { name: "Seg, 16/11" }));
    expect(mon.getByText("Diagrama de casos de uso")).toBeTruthy();
    expect(mon.getByText("3h")).toBeTruthy();
  });
});

describe("W17–W18 Prazos: o objetivo inteiro na data do prazo", () => {
  it("semana: 1 item por objetivo, no dia da entrega, sem os blocos das etapas", async () => {
    await open();
    mode("Prazos");
    expect(screen.getByRole("tab", { name: "Prazos" }).getAttribute("aria-selected")).toBe("true");
    const fri = within(screen.getByRole("group", { name: "Sex, 20/11" }));
    expect(fri.getAllByTitle(`Entrega · ${ENG} · 62%`)).toHaveLength(1);
    expect(deadlineItems(ENG)).toHaveLength(1);
    expect(execBlocks(ENG)).toHaveLength(0);
    expect(screen.getByText("1 entrega")).toBeTruthy();
  });

  it("mês: cada objetivo com prazo aparece 1 vez, na data dele", async () => {
    await open();
    view("Mês");
    mode("Prazos");
    expect(within(await screen.findByRole("group", { name: "Sex, 20/11" })).getAllByTitle(new RegExp(`^Entrega · ${ENG}`))).toHaveLength(1);
    expect(within(screen.getByRole("group", { name: "Sex, 27/11" })).getAllByTitle(/^Entrega · Prova de Cálculo II/)).toHaveLength(1);
    expect(within(screen.getByRole("group", { name: "Sáb, 05/12" })).getAllByTitle(/^Entrega · Portfólio/)).toHaveLength(1);
    expect(deadlineItems(ENG)).toHaveLength(1);
    expect(screen.queryByText("Diagrama de casos de uso")).toBeNull();
  });

  it("dia sem entrega avisa a próxima; dia da entrega mostra o objetivo", async () => {
    await open();
    view("Dia");
    mode("Prazos");
    expect(await screen.findByText(`Nenhuma entrega neste dia · próxima: ${ENG} em 20/11`)).toBeTruthy();
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByRole("button", { name: "Próximo" }));
    expect(await screen.findByText("Sexta, 20/11")).toBeTruthy();
    expect(deadlineItems(ENG)).toHaveLength(1);
  });

  it("objetivo sem prazo não aparece em Prazos (mas tem filtro)", async () => {
    exampleBackend.createGoal({ title: "Ler um livro", deadline: null, kind: "goal", steps: [{ title: "Capítulo 1", estimatedMinutes: 30, microSteps: [] }] });
    await open();
    expect(screen.getByRole("button", { name: /^Ler um livro/ })).toBeTruthy();
    for (const v of ["Dia", "Semana", "Mês"] as const) {
      view(v);
      mode("Prazos");
      expect(screen.getByText("Clique num prazo")).toBeTruthy();
      expect(screen.queryByTitle(/Ler um livro/)).toBeNull();
    }
  });

  it("objetivo concluído com prazo continua em Prazos", async () => {
    exampleBackend.goals[0].status = "done";
    await open();
    mode("Prazos");
    expect(deadlineItems(ENG)).toHaveLength(1);
  });

  it("filtro de objetivo também esconde o prazo", async () => {
    await open();
    mode("Prazos");
    fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${ENG}`) }));
    expect(deadlineItems(ENG)).toHaveLength(0);
    expect(screen.getByText("Nenhuma entrega nesta semana · próxima: Prova de Cálculo II em 27/11")).toBeTruthy();
  });

  it("clicar no prazo abre o detalhe e \"Ver execução\" volta para a semana só com aquele objetivo", async () => {
    await open();
    mode("Prazos");
    fireEvent.click(screen.getByTitle(`Entrega · ${ENG} · 62%`));
    expect(await screen.findByText("Prazo final")).toBeTruthy();
    expect(screen.getByRole("heading", { name: ENG })).toBeTruthy();
    expect(screen.getByText("Entrega · Sexta, 20/11 · em 4 dias")).toBeTruthy();
    expect(screen.getByText("4 de 7 etapas concluídas")).toBeTruthy();
    expect(screen.getByText("Faltam 3h de execução")).toBeTruthy();
    expect(screen.getByText("Próxima etapa: Diagrama de casos de uso · hoje às 20:00")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Ver execução" }));
    expect(screen.getByRole("tab", { name: "Execução" }).getAttribute("aria-selected")).toBe("true");
    expect(execBlocks(ENG)).toHaveLength(3);
    expect(execBlocks("Prova de Cálculo II")).toHaveLength(0);
  });
});

describe("W15–W20 Execução × Prazos nas três visualizações", () => {
  it.each(["Dia", "Semana", "Mês"] as const)("%s: Prazos mostra só objetivos; Execução volta aos blocos", async (v) => {
    await open();
    view(v);
    if (v === "Dia") {
      for (let i = 0; i < 4; i++) fireEvent.click(screen.getByRole("button", { name: "Próximo" }));
      await screen.findByText("Sexta, 20/11");
    }
    mode("Prazos");
    expect(deadlineItems(ENG)).toHaveLength(1);
    expect(screen.queryByText("Simulado 1")).toBeNull();
    mode("Execução");
    expect(deadlineItems(ENG)).toHaveLength(0);
    expect(await screen.findAllByText("Simulado 1")).not.toHaveLength(0);
  });
});

describe("revisão W2: relógio, partes da etapa, teclado e horizonte", () => {
  afterEach(() => vi.restoreAllMocks());

  it("o relógio avançar não devolve a navegação para a semana atual", async () => {
    const now = vi.spyOn(clock, "now").mockReturnValue("2026-11-16T22:40:00.000Z");
    await open();
    fireEvent.click(screen.getByRole("button", { name: "Próximo" }));
    expect(await screen.findByText("23–29 de novembro")).toBeTruthy();
    now.mockReturnValue("2026-11-16T22:41:00.000Z");
    mode("Prazos");
    await act(async () => {});
    expect(screen.getByText("23–29 de novembro")).toBeTruthy();
    view("Dia");
    fireEvent.click(screen.getByRole("button", { name: "Próximo" }));
    now.mockReturnValue("2026-11-16T22:42:00.000Z");
    mode("Execução");
    await act(async () => {});
    expect(screen.getByText("Terça, 24/11")).toBeTruthy();
  });

  it("na visão Dia, etapa dividida em dias diferentes mostra \"Parte 1 de 2\"", async () => {
    await open();
    view("Dia");
    fireEvent.click(screen.getByRole("button", { name: "Próximo" }));
    await screen.findByText("Terça, 17/11");
    fireEvent.click(await screen.findByTitle("Portfólio · Fotos e prints · 22:30–23:00"));
    expect(screen.getByText("Parte 1 de 2 desta etapa")).toBeTruthy();
  });

  it("mês: o dia dentro do horizonte tem botão (teclado); dia passado não", async () => {
    await open();
    view("Mês");
    await screen.findByText("Novembro de 2026");
    expect(screen.queryByRole("button", { name: "Seg, 26/10" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Qua, 18/11" }));
    expect(await screen.findByText("Quarta, 18/11")).toBeTruthy();
  });

  it("cabeçalho do dia fora do horizonte não abre o Dia (Execução e Prazos)", async () => {
    vi.spyOn(clock, "now").mockReturnValue("2026-11-18T22:40:00.000Z");
    await open();
    const past = screen.getByRole("button", { name: "Seg, 16/11" }) as HTMLButtonElement;
    expect(past.disabled).toBe(true);
    fireEvent.click(past);
    expect(screen.getByText("16–22 de novembro")).toBeTruthy();
    mode("Prazos");
    expect((screen.getByRole("button", { name: "Seg, 16/11" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Qui, 19/11" }) as HTMLButtonElement).disabled).toBe(false);
  });
});
