// Resumo do plano devolvido por PUT /scheduling/availability, POST /goals e POST /activation/sessions
// (docs/4-contrato-api.md). Compartilhado porque três endpoints devolvem a mesma forma.
export interface PlanGoalFeasibility {
  goalId: string;
  feasible: boolean;
  usedSlack: boolean;
  slackDays: number | null;
  unscheduledMinutes: number;
}

export interface PlanSummary {
  totalMinutes: number;
  days: number;
  goals: PlanGoalFeasibility[];
}
