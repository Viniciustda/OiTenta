import type { DayPlan, GetAvailabilityResponse, SetAvailabilityResponse, WeekPlanResponse, WeeklyAvailability } from "./scheduling.types";

// Fronteira das telas com /scheduling/*. Etapa B: dados de exemplo; Etapa D: HTTP.
export interface SchedulingRepository {
  setAvailability(input: WeeklyAvailability): Promise<SetAvailabilityResponse>;
  getAvailability(): Promise<GetAvailabilityResponse>;
  getDayPlan(date: string): Promise<DayPlan>;
  getWeekPlan(start: string): Promise<WeekPlanResponse>;
}
