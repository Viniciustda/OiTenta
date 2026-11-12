import type { DraftGoalResponse } from "./goals.types";

// Fronteira das telas com o assistente do novo objetivo (POST /goals/assistant/draft, IA1).
// Não grava nada: quem grava é o GoalsRepository.create.
export interface GoalAssistantRepository {
  /** Falha (503, outro erro HTTP, rede ou timeout) → lança; a tela abre o formulário manual (4f). */
  draft(text: string): Promise<DraftGoalResponse>;
}
