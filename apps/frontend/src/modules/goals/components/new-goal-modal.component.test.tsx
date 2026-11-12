import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/modules/core/data/api-error";
import { goalAssistantRepository, goalsRepository, type DraftGoalResponse, type GoalDraft } from "../data";
import NewGoalModal from "./new-goal-modal.component";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("novo objetivo — W30 começando vazia (P20)", () => {
  it("começa vazia, sem os elementos da IA", () => {
    render(<NewGoalModal onClose={() => {}} onCreated={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Prefiro preencher à mão" }));
    expect((screen.getByLabelText("Objetivo") as HTMLInputElement).value).toBe("");
    expect(screen.getByText("0 etapas · edite o que quiser")).toBeTruthy();
    expect(screen.getByText("0 min")).toBeTruthy();
    expect(screen.queryByText("A IA achou")).toBeNull();
  });

  it("Adicionar etapa, mudar o tempo e somar o total", () => {
    render(<NewGoalModal onClose={() => {}} onCreated={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Prefiro preencher à mão" }));
    fireEvent.click(screen.getByRole("button", { name: "Adicionar etapa" }));
    fireEvent.click(screen.getByRole("button", { name: "Adicionar etapa" }));
    expect(screen.getByText("2 etapas · edite o que quiser")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "Mais 15 min" })[0]);
    expect(screen.getByText("1h15")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "Remover etapa" })[1]);
    expect(screen.getByText("1 etapa · edite o que quiser")).toBeTruthy();
  });

  it("valida antes de encaixar", async () => {
    const create = vi.spyOn(goalsRepository, "create");
    render(<NewGoalModal onClose={() => {}} onCreated={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Prefiro preencher à mão" }));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Encaixar no meu calendário" })));
    expect(screen.getByRole("alert").textContent).toBe("Dá um nome pro objetivo.");
    expect(create).not.toHaveBeenCalled();
  });

  it("Encaixar no meu calendário cria o objetivo", async () => {
    const create = vi.spyOn(goalsRepository, "create");
    const onCreated = vi.fn();
    render(<NewGoalModal onClose={() => {}} onCreated={onCreated} />);
    fireEvent.click(screen.getByRole("button", { name: "Prefiro preencher à mão" }));
    fireEvent.change(screen.getByLabelText("Objetivo"), { target: { value: "Trabalho de Algoritmos" } });
    fireEvent.change(screen.getByLabelText("Entrega"), { target: { value: "2026-11-24" } });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar etapa" }));
    fireEvent.change(screen.getByLabelText("Etapa 1"), { target: { value: "Ler o enunciado" } });
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Encaixar no meu calendário" })));
    expect(create).toHaveBeenCalledWith({
      title: "Trabalho de Algoritmos",
      deadline: "2026-11-24",
      kind: "goal",
      steps: [{ title: "Ler o enunciado", estimatedMinutes: 30, microSteps: [] }],
    });
    expect(onCreated).toHaveBeenCalled();
  });
});

const TEXT = "Trabalho de Algoritmos — implementar e comparar 3 algoritmos de ordenação, entrega 24/11";
const DRAFT: GoalDraft = {
  title: "Trabalho de Algoritmos",
  deadline: "2026-11-24",
  category: "assignment",
  requirements: ["3 algoritmos de ordenação", "comparação de tempo"],
  missingFields: [],
  steps: [
    { title: "Ler o enunciado", estimatedMinutes: 30, aiEstimatedMinutes: 30, microSteps: ["Abra o enunciado"] },
    { title: "Implementar o Merge Sort", estimatedMinutes: 90, aiEstimatedMinutes: 90, microSteps: [] },
  ],
  totalMinutes: 120,
};

/** Rascunho que só responde quando o teste mandar, para ver a W29 no meio. */
function deferredDraft() {
  let resolve!: (r: DraftGoalResponse) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<DraftGoalResponse>((res, rej) => { resolve = res; reject = rej; });
  const spy = vi.spyOn(goalAssistantRepository, "draft").mockReturnValue(promise);
  return { spy, resolve, reject };
}

const analisar = (text = TEXT) => {
  fireEvent.change(screen.getByLabelText("O que você precisa entregar?"), { target: { value: text } });
  fireEvent.click(screen.getByRole("button", { name: "Analisar com IA" }));
};

const openWithDraft = async (draft: GoalDraft = DRAFT) => {
  vi.spyOn(goalAssistantRepository, "draft").mockResolvedValue({ draft, engine: "rules" });
  render(<NewGoalModal onClose={() => {}} onCreated={() => {}} />);
  await act(async () => analisar());
};

describe("novo objetivo com IA — W27 → W29 → W30 preenchida (IA1, IA3)", () => {
  it("abre na W27: abas Escrever / Colar link, \"Analisar com IA\" e, abaixo dele, \"Prefiro preencher à mão\"", () => {
    render(<NewGoalModal onClose={() => {}} onCreated={() => {}} />);
    expect(screen.getByText("Novo objetivo · 1 de 3")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Me conta o que você precisa entregar" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Escrever" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Colar link" })).toBeTruthy();
    expect(screen.getByLabelText("O que você precisa entregar?")).toBeTruthy();
    const analyze = screen.getByRole("button", { name: "Analisar com IA" });
    const manual = screen.getByRole("button", { name: "Prefiro preencher à mão" });
    expect(analyze.compareDocumentPosition(manual) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Encaixar no meu calendário" })).toBeNull();
  });

  it("\"Analisar com IA\" fica desabilitado enquanto o texto está vazio", () => {
    const draft = vi.spyOn(goalAssistantRepository, "draft");
    render(<NewGoalModal onClose={() => {}} onCreated={() => {}} />);
    const analyze = screen.getByRole("button", { name: "Analisar com IA" }) as HTMLButtonElement;
    expect(analyze.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("O que você precisa entregar?"), { target: { value: "   " } });
    expect(analyze.disabled).toBe(true);
    fireEvent.click(analyze);
    expect(draft).not.toHaveBeenCalled();
  });

  it("Analisar mostra a W29 (\"IA analisando…\") e, com o rascunho, a W30 preenchida", async () => {
    const d = deferredDraft();
    render(<NewGoalModal onClose={() => {}} onCreated={() => {}} />);
    analisar();
    expect(d.spy).toHaveBeenCalledWith(TEXT);
    expect(screen.getByText("Novo objetivo · 2 de 3")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Lendo o enunciado…" })).toBeTruthy();
    expect(screen.getByText("IA analisando…")).toBeTruthy();
    expect(screen.queryByLabelText("O que você precisa entregar?")).toBeNull();

    await act(async () => d.resolve({ draft: DRAFT, engine: "llm" }));
    expect(screen.getByText("Novo objetivo · 3 de 3")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Quebrei em etapas pra você" })).toBeTruthy();
    expect((screen.getByLabelText("Objetivo") as HTMLInputElement).value).toBe("Trabalho de Algoritmos");
    expect((screen.getByLabelText("Entrega") as HTMLInputElement).value).toBe("2026-11-24");
    expect(screen.getByText("2 etapas · edite o que quiser")).toBeTruthy();
    expect((screen.getByLabelText("Etapa 2") as HTMLInputElement).value).toBe("Implementar o Merge Sort");
    expect(screen.getByText("2h")).toBeTruthy();
    expect(screen.getByText("A IA achou")).toBeTruthy();
    expect(screen.getByText("3 algoritmos de ordenação")).toBeTruthy();
    expect(screen.getByText("comparação de tempo")).toBeTruthy();
  });

  it("sem requisitos no rascunho, o bloco \"A IA achou\" não aparece", async () => {
    await openWithDraft({ ...DRAFT, requirements: [] });
    expect(screen.getByText("2 etapas · edite o que quiser")).toBeTruthy();
    expect(screen.queryByText("A IA achou")).toBeNull();
  });

  it("rascunho sem prazo (deadline null) mostra a Entrega vazia e encaixa sem prazo (IA2)", async () => {
    const create = vi.spyOn(goalsRepository, "create");
    await openWithDraft({ ...DRAFT, deadline: null, missingFields: ["deadline"] });
    expect((screen.getByLabelText("Entrega") as HTMLInputElement).value).toBe("");
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Encaixar no meu calendário" })));
    expect(create.mock.calls[0][0].deadline).toBeNull();
  });

  it("se a IA falha (503, outro erro ou rede), abre a W30 vazia: o formulário manual (4f)", async () => {
    const d = deferredDraft();
    render(<NewGoalModal onClose={() => {}} onCreated={() => {}} />);
    analisar();
    await act(async () => d.reject(new ApiError(503, "ServiceUnavailableError", "assistant.unavailable")));
    expect(screen.getByRole("button", { name: "Encaixar no meu calendário" })).toBeTruthy();
    expect((screen.getByLabelText("Objetivo") as HTMLInputElement).value).toBe("");
    expect(screen.getByText("0 etapas · edite o que quiser")).toBeTruthy();
    expect(screen.queryByText("A IA achou")).toBeNull();
  });

  it("\"Prefiro preencher à mão\" abre a W30 vazia sem chamar a IA (IA3, P20)", () => {
    const draft = vi.spyOn(goalAssistantRepository, "draft");
    render(<NewGoalModal onClose={() => {}} onCreated={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Prefiro preencher à mão" }));
    expect(draft).not.toHaveBeenCalled();
    expect((screen.getByLabelText("Objetivo") as HTMLInputElement).value).toBe("");
    expect(screen.getByText("0 etapas · edite o que quiser")).toBeTruthy();
    expect(screen.queryByText("A IA achou")).toBeNull();
  });

  it("Encaixar o rascunho da IA envia source ai, a estimativa original da IA e os micro-passos", async () => {
    const create = vi.spyOn(goalsRepository, "create");
    const onCreated = vi.fn();
    vi.spyOn(goalAssistantRepository, "draft").mockResolvedValue({ draft: DRAFT, engine: "llm" });
    render(<NewGoalModal onClose={() => {}} onCreated={onCreated} />);
    await act(async () => analisar());
    fireEvent.click(screen.getAllByRole("button", { name: "Mais 15 min" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Adicionar etapa" }));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Encaixar no meu calendário" })));
    expect(create).toHaveBeenCalledWith({
      title: "Trabalho de Algoritmos",
      deadline: "2026-11-24",
      kind: "goal",
      source: "ai",
      steps: [
        { title: "Ler o enunciado", estimatedMinutes: 45, aiEstimatedMinutes: 30, microSteps: ["Abra o enunciado"] },
        { title: "Implementar o Merge Sort", estimatedMinutes: 90, aiEstimatedMinutes: 90, microSteps: [] },
        { title: "Nova etapa", estimatedMinutes: 30, aiEstimatedMinutes: null, microSteps: [] },
      ],
    });
    expect(onCreated).toHaveBeenCalled();
  });

  it("a aba \"Colar link\" mostra o campo do link, só visual: \"Analisar com IA\" não tem efeito (UC03 em aberto)", () => {
    const draft = vi.spyOn(goalAssistantRepository, "draft");
    render(<NewGoalModal onClose={() => {}} onCreated={() => {}} />);
    fireEvent.change(screen.getByLabelText("O que você precisa entregar?"), { target: { value: TEXT } });
    fireEvent.click(screen.getByRole("button", { name: "Colar link" }));
    expect(screen.getByLabelText("Link da atividade")).toBeTruthy();
    expect(screen.queryByLabelText("O que você precisa entregar?")).toBeNull();
    fireEvent.change(screen.getByLabelText("Link da atividade"), { target: { value: "moodle.suafacul.edu.br/mod/assign/view.php?id=5170" } });
    const analyze = screen.getByRole("button", { name: "Analisar com IA" }) as HTMLButtonElement;
    expect(analyze.disabled).toBe(true);
    fireEvent.click(analyze);
    expect(draft).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Escrever" }));
    expect((screen.getByLabelText("O que você precisa entregar?") as HTMLTextAreaElement).value).toBe(TEXT);
  });
});
