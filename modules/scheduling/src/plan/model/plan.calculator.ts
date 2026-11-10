import {
  addDays,
  Interval,
  MINUTE_MS,
  minutesBetween,
  subtractIntervals,
  toLocalParts,
} from "../../common";

export interface PlanStepInput {
  stepId: string;
  order: number;
  remainingMinutes: number;
}

export interface PlanGoalInput {
  goalId: string;
  /** Data local `YYYY-MM-DD` da entrega, ou `null` (sem prazo, P3). */
  deadline: string | null;
  createdAt: Date;
  steps: PlanStepInput[];
}

export interface PlanCalculatorInput {
  now: Date;
  timezone: string;
  freeIntervals: Interval[];
  dailyLimitMinutes: number;
  /** Blocos do passado, concluídos e fixados: contam para o limite e não mudam. */
  fixedBlocks: Interval[];
  goals: PlanGoalInput[];
  slackDays?: number;
  minBlockMinutes?: number;
  granularity?: number;
}

export interface PlanBlock {
  goalId: string;
  stepId: string;
  start: Date;
  end: Date;
}

export interface GoalFeasibility {
  goalId: string;
  scheduledMinutes: number;
  unscheduledMinutes: number;
  feasible: boolean;
  /** `true` quando o plano manteve a folga antes do prazo. */
  usedSlack: boolean;
  /** Dias de folga mantidos; `null` para objetivo sem prazo. */
  slackDays: number | null;
}

export interface PlanSummary {
  totalMinutes: number;
  days: number;
}

export interface PlanCalculatorOutput {
  blocks: PlanBlock[];
  goals: GoalFeasibility[];
  summary: PlanSummary;
}

interface Segment {
  start: number;
  end: number;
  day: string;
}

interface State {
  segments: Segment[];
  usage: Map<string, number>;
  blocks: PlanBlock[];
}

interface Settings {
  dailyLimitMinutes: number;
  minBlockMinutes: number;
  granularity: number;
}

interface Allocation {
  state: State;
  unscheduledMinutes: number;
}

/**
 * Motor do plano (D 4g): guloso por prazo mais cedo, etapas em ordem, limite
 * diário somado entre todos os objetivos, folga antes do prazo que cai se for
 * o único jeito de caber. Puro, determinístico e sem IA.
 */
export class PlanCalculator {
  calculate(input: PlanCalculatorInput): PlanCalculatorOutput {
    const slackDays = input.slackDays ?? 1;
    const settings: Settings = {
      dailyLimitMinutes: input.dailyLimitMinutes,
      minBlockMinutes: input.minBlockMinutes ?? 30,
      granularity: input.granularity ?? 15,
    };
    const dayOf = (instant: Date) => toLocalParts(instant, input.timezone).date;

    const usage = new Map<string, number>();
    for (const fixed of input.fixedBlocks) {
      const day = dayOf(fixed.start);
      usage.set(day, (usage.get(day) ?? 0) + minutesBetween(fixed.start, fixed.end));
    }
    const segments = subtractIntervals(input.freeIntervals, input.fixedBlocks).map((interval) => ({
      start: interval.start.getTime(),
      end: interval.end.getTime(),
      day: dayOf(interval.start),
    }));

    let state: State = { segments, usage, blocks: [] };
    const goals: GoalFeasibility[] = [];

    for (const goal of sortGoals(input.goals)) {
      const steps = [...goal.steps]
        .sort((a, b) => a.order - b.order || compareText(a.stepId, b.stepId))
        .map((step) => ({ ...step, remainingMinutes: roundUp(step.remainingMinutes, settings.granularity) }))
        .filter((step) => step.remainingMinutes > 0);
      const needed = steps.reduce((total, step) => total + step.remainingMinutes, 0);
      const allocate = (lastDay: string | null) => allocateGoal(state, goal.goalId, steps, lastDay, settings);

      let allocation: Allocation;
      let feasibility: Omit<GoalFeasibility, "goalId" | "scheduledMinutes" | "unscheduledMinutes">;

      if (goal.deadline === null) {
        allocation = allocate(null);
        feasibility = { feasible: true, usedSlack: false, slackDays: null };
      } else {
        const withSlack = allocate(addDays(goal.deadline, -1 - slackDays));
        if (withSlack.unscheduledMinutes === 0) {
          allocation = withSlack;
          feasibility = { feasible: true, usedSlack: true, slackDays };
        } else {
          allocation = allocate(addDays(goal.deadline, -1));
          feasibility = {
            feasible: allocation.unscheduledMinutes === 0,
            usedSlack: false,
            slackDays: 0,
          };
        }
      }

      state = allocation.state;
      goals.push({
        goalId: goal.goalId,
        scheduledMinutes: needed - allocation.unscheduledMinutes,
        unscheduledMinutes: allocation.unscheduledMinutes,
        ...feasibility,
      });
    }

    const blocks = [...state.blocks].sort((a, b) => a.start.getTime() - b.start.getTime());
    return {
      blocks,
      goals,
      summary: {
        totalMinutes: blocks.reduce((total, block) => total + minutesBetween(block.start, block.end), 0),
        days: new Set(blocks.map((block) => dayOf(block.start))).size,
      },
    };
  }
}

function compareText(a: string, b: string): number {
  return a.localeCompare(b, "en");
}

function roundUp(minutes: number, granularity: number): number {
  return Math.ceil(minutes / granularity) * granularity;
}

/** Prazo mais cedo primeiro; sem prazo por último (P3); depois criação e id. */
function sortGoals(goals: PlanGoalInput[]): PlanGoalInput[] {
  return [...goals].sort((a, b) => {
    if (a.deadline !== b.deadline) {
      if (a.deadline === null) return 1;
      if (b.deadline === null) return -1;
      return compareText(a.deadline, b.deadline);
    }
    return a.createdAt.getTime() - b.createdAt.getTime() || compareText(a.goalId, b.goalId);
  });
}

/** Tenta alocar as etapas de um objetivo numa cópia do estado, até `lastDay` (inclusive). */
function allocateGoal(
  original: State,
  goalId: string,
  steps: PlanStepInput[],
  lastDay: string | null,
  settings: Settings,
): Allocation {
  const state: State = {
    segments: original.segments.map((segment) => ({ ...segment })),
    usage: new Map(original.usage),
    blocks: [...original.blocks],
  };
  let cursor = Number.NEGATIVE_INFINITY;

  for (let index = 0; index < steps.length; index++) {
    const step = steps[index] as PlanStepInput;
    let remaining = step.remainingMinutes;

    for (let segmentIndex = 0; remaining > 0 && segmentIndex < state.segments.length; segmentIndex++) {
      const segment = state.segments[segmentIndex] as Segment;
      if (lastDay !== null && segment.day > lastDay) {
        break;
      }
      if (segment.start < cursor) {
        continue;
      }
      const start = segment.start;
      const segmentMinutes = Math.floor((segment.end - start) / MINUTE_MS);
      const dayMinutes = settings.dailyLimitMinutes - (state.usage.get(segment.day) ?? 0);
      const available = floorTo(Math.min(segmentMinutes, dayMinutes), settings.granularity);
      const chunk = chooseChunk(remaining, available, settings.minBlockMinutes);
      if (chunk <= 0) {
        continue;
      }

      const end = start + chunk * MINUTE_MS;
      state.blocks.push({ goalId, stepId: step.stepId, start: new Date(start), end: new Date(end) });
      state.usage.set(segment.day, (state.usage.get(segment.day) ?? 0) + chunk);
      if (end < segment.end) {
        segment.start = end;
      } else {
        state.segments.splice(segmentIndex, 1);
        segmentIndex--;
      }
      remaining -= chunk;
      cursor = end;
    }

    if (remaining > 0) {
      const rest = steps.slice(index + 1).reduce((total, item) => total + item.remainingMinutes, 0);
      return { state, unscheduledMinutes: remaining + rest };
    }
  }

  return { state, unscheduledMinutes: 0 };
}

function floorTo(minutes: number, granularity: number): number {
  return Math.max(0, Math.floor(minutes / granularity) * granularity);
}

/**
 * Tamanho do próximo bloco (P10): tudo o que falta se couber; senão, um pedaço
 * de pelo menos `minBlock`, evitando deixar um resto menor que `minBlock`
 * quando possível. Zero quando não dá para colocar nada aqui.
 */
function chooseChunk(remaining: number, available: number, minBlock: number): number {
  if (remaining <= available) {
    return remaining;
  }
  if (available < minBlock) {
    return 0;
  }
  const leftover = remaining - available;
  if (leftover < minBlock && remaining - minBlock >= minBlock) {
    return remaining - minBlock;
  }
  return available;
}
