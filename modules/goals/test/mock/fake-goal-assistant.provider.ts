import {
  GoalAssistantProvider,
  ParsedGoal,
  ParseGoalIn,
  SuggestedSteps,
  SuggestStepsIn,
} from "../../src";

/** Dublê de teste da porta do assistente: respostas programadas e registro das chamadas. Não é o motor de regras. */
export class FakeGoalAssistantProvider implements GoalAssistantProvider {
  readonly parseCalls: ParseGoalIn[] = [];
  readonly suggestCalls: SuggestStepsIn[] = [];

  constructor(
    public parsed: ParsedGoal = {
      title: "Trabalho de Algoritmos",
      deadline: "2026-11-24",
      category: "assignment",
      requirements: ["3 algoritmos de ordenação"],
      missingFields: [],
      engine: "llm",
    },
    public suggested: SuggestedSteps = {
      steps: [
        { title: "Ler o enunciado", estimatedMinutes: 30, microSteps: ["Abra o enunciado"] },
        { title: "Implementar os algoritmos", estimatedMinutes: 120, microSteps: [] },
      ],
      engine: "llm",
    },
    public error: Error | null = null,
  ) {}

  async parseGoal(input: ParseGoalIn): Promise<ParsedGoal> {
    this.parseCalls.push(input);
    if (this.error) {
      throw this.error;
    }
    return this.parsed;
  }

  async suggestSteps(input: SuggestStepsIn): Promise<SuggestedSteps> {
    this.suggestCalls.push(input);
    return this.suggested;
  }
}
