import type { HttpClient } from "@/modules/core/data/http-client";
import type { GoalAssistantRepository } from "./goal-assistant.repository";
import type { DraftGoalResponse } from "./goals.types";

// POST /goals/assistant/draft no backend real (docs/4-contrato-api.md §3).
export class HttpGoalAssistantRepository implements GoalAssistantRepository {
  /** Maior que o orçamento de 15 s do backend (docs/7-proposta-ia.md §c.5). */
  static readonly TIMEOUT_MS = 25_000;

  constructor(
    private readonly http: HttpClient,
    private readonly timeoutMs: number = HttpGoalAssistantRepository.TIMEOUT_MS,
  ) {}

  async draft(text: string): Promise<DraftGoalResponse> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      return await this.http.post<DraftGoalResponse>("/goals/assistant/draft", { text }, { signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }
}
