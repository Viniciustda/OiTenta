import type { CreateGoalInput, CreateGoalResponse, GetGoalResponse, ListGoalsResponse } from "./goals.types";

// Fronteira das telas com /goals. Etapa B: dados de exemplo; Etapa D: HTTP.
export interface GoalsRepository {
  list(): Promise<ListGoalsResponse>;
  get(goalId: string): Promise<GetGoalResponse>;
  create(input: CreateGoalInput): Promise<CreateGoalResponse>;
}
