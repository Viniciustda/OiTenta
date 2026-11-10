import { clone, ExampleBackend, exampleBackend, type ExampleGoal } from "@/modules/core/data/example-backend";
import type { GoalsRepository } from "./goals.repository";
import type { CreateGoalInput, CreateGoalResponse, GetGoalResponse, Goal, GoalStepDetail, ListGoalsResponse } from "./goals.types";

const toGoal = ({ id, title, deadline, kind, colorIndex, progressPct, status }: ExampleGoal): Goal => ({
  id, title, deadline, kind, colorIndex, progressPct, status,
});
const remaining = (minutes: number, pct: number) => (pct >= 100 ? 0 : Math.ceil((minutes * (1 - pct / 100)) / 15) * 15);
const summary = (g: ExampleGoal) => ({ done: g.steps.filter((s) => s.status === "done").length, total: g.steps.filter((s) => s.status !== "superseded").length });

// Dados de exemplo (Etapa B): os 3 objetivos do protótipo web.
export class ExampleGoalsRepository implements GoalsRepository {
  constructor(private readonly backend: ExampleBackend = exampleBackend) {}

  async list(): Promise<ListGoalsResponse> {
    return {
      goals: this.backend.goals.map((g) => ({
        id: g.id, title: g.title, deadline: g.deadline, colorIndex: g.colorIndex, progressPct: g.progressPct,
        ...summary(g), status: g.status, slackDays: g.slackDays,
      })),
    };
  }

  async get(goalId: string): Promise<GetGoalResponse> {
    const g = this.backend.findGoal(goalId);
    const steps: GoalStepDetail[] = g.steps.map((s) => {
      const next = s.status === "done" ? undefined : this.backend.blocks
        .filter((b) => b.stepId === s.id && b.status === "planned")
        .sort((a, b) => a.start.localeCompare(b.start))[0];
      return {
        id: s.id, order: s.order, title: s.title, estimatedMinutes: s.estimatedMinutes, progressPct: s.progressPct, status: s.status,
        remainingMinutes: remaining(s.estimatedMinutes, s.progressPct),
        ...(next ? { nextBlock: { id: next.id, start: next.start, end: next.end } } : {}),
      };
    });
    return clone({ goal: toGoal(g), steps, progressPct: g.progressPct, ...summary(g) });
  }

  async create(input: CreateGoalInput): Promise<CreateGoalResponse> {
    const g = this.backend.createGoal(input);
    const total = g.steps.reduce((a, s) => a + s.estimatedMinutes, 0);
    return clone({
      goal: { ...toGoal(g), steps: g.steps },
      // O exemplo não calcula plano: o objetivo novo não é encaixado (o motor real entra na Etapa C/D).
      plan: { totalMinutes: total, days: 0, goals: [{ goalId: g.id, feasible: true, usedSlack: false, slackDays: null, unscheduledMinutes: total }] },
    });
  }
}
