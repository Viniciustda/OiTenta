import { NotFoundError, UseCase, ValidationRule, Validator } from "@oitenta/shared";
import { WeeklyAvailabilityRepository } from "../../availability/provider";
import { addDays, LocalDateRule, localDateRules, localToUtc, weekdayOf } from "../../common";
import { ScheduledBlockRepository } from "../provider";
import { buildDayPlan, DayPlan } from "./day-plan";

export interface GetWeekPlanIn {
  userId: string;
  /** Segunda-feira local `YYYY-MM-DD`. */
  weekStart: string;
  timezone: string;
}

export type WeekPlanDay = DayPlan;

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
    const blocks = await this.blockRepository.findByUserInRange(input.userId, from, to);
    const days = Array.from({ length: 7 }, (_, index) =>
      buildDayPlan(
        addDays(input.weekStart, index),
        blocks,
        input.timezone,
        availability.dailyLimitMinutes,
      ),
    );

    return { days };
  }
}
