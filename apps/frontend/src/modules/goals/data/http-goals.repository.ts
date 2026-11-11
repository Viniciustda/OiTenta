import type { HttpClient } from "@/modules/core/data/http-client";
import type { GoalsRepository } from "./goals.repository";
import type { CreateGoalInput, CreateGoalResponse, GetGoalResponse, ListGoalsResponse } from "./goals.types";

// /goals no backend real (docs/4-contrato-api.md §3).
export class HttpGoalsRepository implements GoalsRepository {
  constructor(private readonly http: HttpClient) {}

  list(): Promise<ListGoalsResponse> {
    return this.http.get<ListGoalsResponse>("/goals");
  }

  get(goalId: string): Promise<GetGoalResponse> {
    return this.http.get<GetGoalResponse>(`/goals/${encodeURIComponent(goalId)}`);
  }

  create(input: CreateGoalInput): Promise<CreateGoalResponse> {
    return this.http.post<CreateGoalResponse>("/goals", input);
  }
}
