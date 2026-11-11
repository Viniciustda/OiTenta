import { GetGoal, GoalListItem, GoalRepository } from '@oitenta/goals';
import { GeneratePlanOut, PlanGoalInput } from '@oitenta/scheduling';

// docs/3 §5: o plano recebe os objetivos ativos com as etapas e os remainingMinutes
// já calculados pelo goals (ListGoals + GetGoal). Só tradução de formato, sem cálculo.
export async function toPlanGoals(
  goalRepository: GoalRepository,
  userId: string,
  goals: GoalListItem[],
): Promise<PlanGoalInput[]> {
  const getGoal = new GetGoal(goalRepository);
  const active = goals.filter((goal) => goal.status === 'active');
  return Promise.all(
    active.map(async (goal) => {
      const { steps } = await getGoal.execute({ userId, goalId: goal.id });
      return {
        goalId: goal.id,
        deadline: goal.deadline,
        createdAt: goal.createdAt,
        steps: steps.map((step) => ({
          stepId: step.id,
          order: step.order,
          remainingMinutes: step.remainingMinutes,
        })),
      };
    }),
  );
}

export interface PlanGoalView {
  goalId: string;
  feasible: boolean;
  usedSlack: boolean;
  slackDays: number | null;
  scheduledMinutes: number;
  unscheduledMinutes: number;
}

export interface PlanView {
  totalMinutes: number;
  days: number;
  goals: PlanGoalView[];
}

// Formato do contrato (docs/4 §2): { totalMinutes, days, goals[] }.
export function toPlanView(plan: GeneratePlanOut): PlanView {
  return {
    totalMinutes: plan.summary.totalMinutes,
    days: plan.summary.days,
    goals: plan.goals.map((goal) => ({
      goalId: goal.goalId,
      feasible: goal.feasible,
      usedSlack: goal.usedSlack,
      slackDays: goal.slackDays,
      scheduledMinutes: goal.scheduledMinutes,
      unscheduledMinutes: goal.unscheduledMinutes,
    })),
  };
}
