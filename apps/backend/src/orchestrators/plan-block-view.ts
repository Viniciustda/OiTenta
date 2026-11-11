import { GetGoal, GetGoalOut, GoalRepository } from '@oitenta/goals';
import { DayPlan } from '@oitenta/scheduling';

// Composição (P17): junta aos blocos o título e a cor do objetivo e o título da etapa,
// lidos pelo GetGoal de cada objetivo presente nos blocos. Nenhum cálculo.
export interface PlanBlockView {
  id: string;
  start: Date;
  end: Date;
  status: string;
  goalId: string;
  goalTitle: string;
  colorIndex: number;
  stepId: string;
  stepTitle: string;
}

export interface DayPlanView {
  date: string;
  blocks: PlanBlockView[];
  usedMinutes: number;
  limitMinutes: number;
}

export async function loadGoalsOf(
  goalRepository: GoalRepository,
  userId: string,
  days: DayPlan[],
): Promise<Map<string, GetGoalOut>> {
  const goalIds = [
    ...new Set(days.flatMap((day) => day.blocks.map((block) => block.goalId))),
  ];
  const getGoal = new GetGoal(goalRepository);
  const goals = await Promise.all(
    goalIds.map((goalId) => getGoal.execute({ userId, goalId })),
  );
  return new Map(goals.map((goal) => [goal.goal.id, goal]));
}

export function toDayPlanView(
  day: DayPlan,
  goals: Map<string, GetGoalOut>,
): DayPlanView {
  return {
    date: day.date,
    blocks: day.blocks.map((block) => {
      // Todo objetivo dos blocos foi lido em loadGoalsOf; as etapas nunca são apagadas (D 4h).
      const goal = goals.get(block.goalId) as GetGoalOut;
      const step = goal.steps.find((item) => item.id === block.stepId);
      return {
        id: block.id,
        start: block.start,
        end: block.end,
        status: block.status,
        goalId: block.goalId,
        goalTitle: goal.goal.title,
        colorIndex: goal.goal.colorIndex,
        stepId: block.stepId,
        stepTitle: step?.title ?? '',
      };
    }),
    usedMinutes: day.usedMinutes,
    limitMinutes: day.limitMinutes,
  };
}
