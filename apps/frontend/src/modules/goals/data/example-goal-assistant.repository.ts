import { clone } from "@/modules/core/data/example-backend";
import { unprocessable } from "@/modules/core/data/api-error";
import type { GoalAssistantRepository } from "./goal-assistant.repository";
import type { DraftGoalResponse, GoalDraftStep } from "./goals.types";

// Etapas e tempos do protótipo (ModalNovoObjetivo.dc.html, defaults()).
const STEPS: [string, number, string[]][] = [
  ["Ler o enunciado e escolher os 3 algoritmos", 30, ["Abra o enunciado e copie os itens pedidos numa lista"]],
  ["Implementar o Bubble Sort", 45, []],
  ["Implementar o Merge Sort", 90, []],
  ["Implementar o Quick Sort", 90, []],
  ["Gerar as entradas de teste", 45, []],
  ["Medir os tempos e montar os gráficos", 90, []],
  ["Escrever o relatório comparativo", 105, []],
];

const steps: GoalDraftStep[] = STEPS.map(([title, minutes, microSteps]) => ({
  title, estimatedMinutes: minutes, aiEstimatedMinutes: minutes, microSteps,
}));

// "IA" de exemplo: o rascunho fixo da W30 do protótipo, qualquer que seja o texto. Prazo 24/11, oito
// dias depois do relógio de exemplo (16/11), como no protótipo. Os requisitos são os chips de "A IA achou"
// sem o "entrega 24/11", que o contrato não traz (o prazo vem em deadline).
const DRAFT: DraftGoalResponse = {
  draft: {
    title: "Trabalho de Algoritmos",
    deadline: "2026-11-24",
    category: "assignment",
    requirements: ["3 algoritmos de ordenação", "comparação de tempo", "código + relatório"],
    missingFields: [],
    steps,
    totalMinutes: steps.reduce((a, s) => a + s.estimatedMinutes, 0),
  },
  engine: "llm",
};

export class ExampleGoalAssistantRepository implements GoalAssistantRepository {
  /** delayMs: o "IA analisando…" do protótipo dura 1900 ms (analisar → setTimeout). */
  constructor(private readonly delayMs = 1900) {}

  async draft(text: string): Promise<DraftGoalResponse> {
    const t = text.trim();
    if (!t) throw unprocessable(["goal-draft.text.required"]);
    if (t.length > 2000) throw unprocessable(["goal-draft.text.max-length"]);
    if (this.delayMs > 0) await new Promise((r) => setTimeout(r, this.delayMs));
    return clone(DRAFT);
  }
}
