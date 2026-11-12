import { UseCase } from "@oitenta/shared";
import { Goal, GOAL_COLOR_INDEXES, GoalColorIndex, GoalKind, GoalSource, Step } from "../model";
import { GoalRepository } from "../provider";
import { GoalView, toGoalView } from "./goal-view";

export interface CreateGoalStepIn {
  title: string;
  estimatedMinutes: number;
  /** Estimativa original da IA (D 4f, IA1); null ou ausente no objetivo manual. */
  aiEstimatedMinutes?: number | null;
  microSteps?: string[];
}

export interface CreateGoalIn {
  userId: string;
  title: string;
  deadline?: string | null;
  kind: GoalKind;
  /** Padrão "manual"; "ai" quando o objetivo veio do rascunho do assistente (IA1). */
  source?: GoalSource;
  steps: CreateGoalStepIn[];
}

export interface CreateGoalOut {
  goal: GoalView;
}

export class CreateGoal implements UseCase<CreateGoalIn, CreateGoalOut> {
  constructor(private readonly goalRepository: GoalRepository) {}

  async execute(input: CreateGoalIn): Promise<CreateGoalOut> {
    const colorIndex = await this.nextColorIndex(input.userId);

    const draft = new Goal({
      userId: input.userId,
      title: input.title.trim(),
      deadline: input.deadline ?? null,
      kind: input.kind,
      colorIndex,
      source: input.source ?? "manual",
      status: "active",
      steps: [],
    });

    const steps = input.steps.map(
      (step, index) =>
        new Step({
          goalId: draft.id,
          order: index + 1,
          title: step.title.trim(),
          estimatedMinutes: step.estimatedMinutes,
          aiEstimatedMinutes: step.aiEstimatedMinutes ?? null,
          progressPct: 0,
          status: "pending",
          microSteps: step.microSteps ?? [],
        }),
    );

    const goal = draft.clone({ steps, updatedAt: draft.updatedAt });
    goal.validate();

    await this.goalRepository.create(goal);

    return { goal: toGoalView(goal) };
  }

  private async nextColorIndex(userId: string): Promise<GoalColorIndex> {
    const goals = await this.goalRepository.findAllByUser(userId);
    const activeCount = goals.filter((goal) => goal.status === "active").length;

    return ((activeCount % GOAL_COLOR_INDEXES.length) + 1) as GoalColorIndex;
  }
}
