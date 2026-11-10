import { NotFoundError } from "@oitenta/shared";
import { AvailabilityCalculator } from "../../availability/model";
import { BusySource, WeeklyAvailabilityRepository } from "../../availability/provider";
import { addDays, localToUtc, toLocalParts } from "../../common";
import { PlanCalculator, PlanCalculatorOutput, PlanGoalInput, ScheduledBlock } from "../model";
import { ScheduledBlockRepository } from "../provider";

/** Dias à frente que o plano cobre quando nenhum prazo vai além disso (objetivos sem prazo). */
export const PLAN_HORIZON_DAYS = 28;

export interface PlanSimulationIn {
  userId: string;
  timezone: string;
  now: Date;
  goals: PlanGoalInput[];
}

export interface PlanSimulationDeps {
  availabilityRepository: WeeklyAvailabilityRepository;
  blockRepository: ScheduledBlockRepository;
  busySource: BusySource;
}

/** Bloco que o recálculo pode trocar: futuro, `planned`, não fixado e automático (D 4g). */
export function isReplaceable(block: ScheduledBlock, now: Date): boolean {
  return block.start >= now && block.status === "planned" && !block.pinned && block.origin === "auto";
}

/**
 * Monta a entrada do `PlanCalculator` a partir dos dados do usuário e calcula
 * o plano sem gravar nada (modo simulação). Usado por `GeneratePlan` e
 * `GetGoalsFeasibility`.
 */
export async function simulatePlan(
  deps: PlanSimulationDeps,
  input: PlanSimulationIn,
): Promise<PlanCalculatorOutput> {
  const availability = await deps.availabilityRepository.findByUser(input.userId);
  if (!availability) {
    throw new NotFoundError("Disponibilidade não encontrada.");
  }

  const today = toLocalParts(input.now, input.timezone).date;
  const horizonDate = input.goals.reduce(
    (latest, goal) => (goal.deadline !== null && goal.deadline > latest ? goal.deadline : latest),
    addDays(today, PLAN_HORIZON_DAYS),
  );
  const from = localToUtc(today, 0, input.timezone);
  const to = localToUtc(horizonDate, 0, input.timezone);

  const existing = await deps.blockRepository.findByUserInRange(input.userId, from, to);
  const fixedBlocks = existing
    .filter((block) => !isReplaceable(block, input.now))
    .map((block) => ({ start: block.start, end: block.end }));
  const busy = await deps.busySource.listBusy(input.userId, input.now, to, input.timezone);
  const freeIntervals = new AvailabilityCalculator().freeIntervals({
    windows: availability.windows,
    timezone: input.timezone,
    from: input.now,
    to,
    busy,
    now: input.now,
  });

  return new PlanCalculator().calculate({
    now: input.now,
    timezone: input.timezone,
    freeIntervals,
    dailyLimitMinutes: availability.dailyLimitMinutes,
    fixedBlocks,
    goals: input.goals,
  });
}
