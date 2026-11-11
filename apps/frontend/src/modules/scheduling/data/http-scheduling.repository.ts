import type { HttpClient } from "@/modules/core/data/http-client";
import type { SchedulingRepository } from "./scheduling.repository";
import type { DayPlan, GetAvailabilityResponse, SetAvailabilityResponse, WeekPlanResponse, WeeklyAvailability } from "./scheduling.types";

// /scheduling/* no backend real (docs/4-contrato-api.md §2 e §4).
export class HttpSchedulingRepository implements SchedulingRepository {
  constructor(private readonly http: HttpClient) {}

  setAvailability(input: WeeklyAvailability): Promise<SetAvailabilityResponse> {
    return this.http.put<SetAvailabilityResponse>("/scheduling/availability", input);
  }

  getAvailability(): Promise<GetAvailabilityResponse> {
    return this.http.get<GetAvailabilityResponse>("/scheduling/availability");
  }

  getDayPlan(date: string): Promise<DayPlan> {
    return this.http.get<DayPlan>("/scheduling/plan/day", { date });
  }

  getWeekPlan(start: string): Promise<WeekPlanResponse> {
    return this.http.get<WeekPlanResponse>("/scheduling/plan/week", { start });
  }
}
