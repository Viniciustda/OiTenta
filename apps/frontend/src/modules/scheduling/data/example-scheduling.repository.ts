import { badRequest, notFound, unprocessable } from "@/modules/core/data/api-error";
import { clone, ExampleBackend, exampleBackend } from "@/modules/core/data/example-backend";
import { addDays, localDate, weekdayIndex } from "@/modules/core/format/time.format";
import type { SchedulingRepository } from "./scheduling.repository";
import type { DayPlan, GetAvailabilityResponse, PlanBlock, SetAvailabilityResponse, WeekPlanResponse, WeeklyAvailability } from "./scheduling.types";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const isDate = (d: string) => DATE_RE.test(d) && !Number.isNaN(new Date(`${d}T00:00:00Z`).getTime());

// Dados de exemplo (Etapa B): a grade e o plano do protótipo web.
export class ExampleSchedulingRepository implements SchedulingRepository {
  constructor(private readonly backend: ExampleBackend = exampleBackend) {}

  async setAvailability(input: WeeklyAvailability): Promise<SetAvailabilityResponse> {
    const errors: string[] = [];
    if (!input.windows?.length) errors.push("availability.windows.required");
    input.windows?.forEach((w) => {
      if (w.weekday < 0 || w.weekday > 6 || w.startMinute >= w.endMinute || w.startMinute % 15 || w.endMinute % 15)
        errors.push("availability.window.invalid");
    });
    const l = input.dailyLimitMinutes;
    if (l < 60 || l > 480 || l % 30) errors.push("availability.dailyLimit.invalid");
    if (errors.length) throw unprocessable(errors);
    this.backend.availability = clone(input);
    return { availability: clone(input), plan: this.backend.planSummary() };
  }

  async getAvailability(): Promise<GetAvailabilityResponse> {
    if (!this.backend.availability) throw notFound("Disponibilidade ainda não cadastrada");
    return { availability: clone(this.backend.availability) };
  }

  private timezone() {
    return this.backend.currentUser().timezone;
  }

  private day(date: string): DayPlan {
    const tz = this.timezone();
    const blocks: PlanBlock[] = this.backend.blocks
      .filter((b) => localDate(b.start, tz) === date)
      .sort((a, b) => a.start.localeCompare(b.start))
      .map((b) => {
        const goal = this.backend.goals.find((g) => g.id === b.goalId)!;
        const step = goal.steps.find((s) => s.id === b.stepId)!;
        return { id: b.id, start: b.start, end: b.end, status: b.status, goalId: goal.id, goalTitle: goal.title, colorIndex: goal.colorIndex, stepId: step.id, stepTitle: step.title };
      });
    const used = this.backend.blocks
      .filter((b) => localDate(b.start, tz) === date && b.status !== "missed")
      .reduce((a, b) => a + this.backend.minutesOf(b), 0);
    return { date, blocks, usedMinutes: used, limitMinutes: this.backend.availability?.dailyLimitMinutes ?? 0 };
  }

  async getDayPlan(date: string): Promise<DayPlan> {
    if (!isDate(date)) throw badRequest("Data inválida");
    return this.day(date);
  }

  async getWeekPlan(start: string): Promise<WeekPlanResponse> {
    if (!isDate(start) || weekdayIndex(start) !== 0) throw badRequest("A semana começa numa segunda-feira (YYYY-MM-DD)");
    return { days: Array.from({ length: 7 }, (_, i) => this.day(addDays(start, i))) };
  }
}
