import { NotFoundError, UseCase, ValidationRule, Validator } from "@oitenta/shared";
import { WeeklyAvailabilityRepository } from "../../availability/provider";
import { addDays, LocalDateRule, localDateRules, localToUtc, toLocalParts, weekdayOf } from "../../common";
import { ScheduledBlock } from "../model";
import { ScheduledBlockRepository } from "../provider";

export interface GetWeekPlanIn {
  userId: string;
  /** Segunda-feira local `YYYY-MM-DD`. */
  weekStart: string;
  timezone: string;
}

export interface WeekPlanDay {
  date: string;
  blocks: ScheduledBlock[];
  usedMinutes: number;
  limitMinutes: number;
}

export interface GetWeekPlanOut {
  days: WeekPlanDay[];
}

const mondayRule: ValidationRule = {
  validate: (value) =>
    new LocalDateRule().validate(value) === null && weekdayOf(value as string) !== 0
      ? "not.monday"
      : null,
};

/** Os 7 dias da semana (segunda a domingo) com os blocos, os minutos usados e o limite diário. */
export class GetWeekPlan implements UseCase<GetWeekPlanIn, GetWeekPlanOut> {
  constructor(
    private readonly blockRepository: ScheduledBlockRepository,
    private readonly availabilityRepository: WeeklyAvailabilityRepository,
  ) {}

  async execute(input: GetWeekPlanIn): Promise<GetWeekPlanOut> {
    Validator.validate([
      { code: "weekPlan.weekStart", value: input.weekStart, rules: [...localDateRules(), mondayRule] },
    ]);

    const availability = await this.availabilityRepository.findByUser(input.userId);
    if (!availability) {
      throw new NotFoundError("Disponibilidade não encontrada.");
    }

    const from = localToUtc(input.weekStart, 0, input.timezone);
    const to = localToUtc(addDays(input.weekStart, 7), 0, input.timezone);
    const blocks = [...(await this.blockRepository.findByUserInRange(input.userId, from, to))].sort(
      (a, b) => a.start.getTime() - b.start.getTime(),
    );

    const days = Array.from({ length: 7 }, (_, index) => {
      const date = addDays(input.weekStart, index);
      const ofDay = blocks.filter((block) => toLocalParts(block.start, input.timezone).date === date);
      return {
        date,
        blocks: ofDay,
        usedMinutes: ofDay.reduce((total, block) => total + block.durationMinutes, 0),
        limitMinutes: availability.dailyLimitMinutes,
      };
    });

    return { days };
  }
}
