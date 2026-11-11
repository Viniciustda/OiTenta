import { NotFoundError, UseCase, Validator } from "@oitenta/shared";
import { WeeklyAvailabilityRepository } from "../../availability/provider";
import { addDays, localDateRules, localToUtc } from "../../common";
import { ScheduledBlockRepository } from "../provider";
import { buildDayPlan, DayPlan } from "./day-plan";

export interface GetDayPlanIn {
  userId: string;
  /** Data local `YYYY-MM-DD`. */
  date: string;
  timezone: string;
}

export type GetDayPlanOut = DayPlan;

/** Blocos que começam no dia local pedido (P13), com os minutos usados e o limite diário. */
export class GetDayPlan implements UseCase<GetDayPlanIn, GetDayPlanOut> {
  constructor(
    private readonly blockRepository: ScheduledBlockRepository,
    private readonly availabilityRepository: WeeklyAvailabilityRepository,
  ) {}

  async execute(input: GetDayPlanIn): Promise<GetDayPlanOut> {
    Validator.validate([{ code: "dayPlan.date", value: input.date, rules: localDateRules() }]);

    const availability = await this.availabilityRepository.findByUser(input.userId);
    if (!availability) {
      throw new NotFoundError("Disponibilidade não encontrada.");
    }

    const from = localToUtc(input.date, 0, input.timezone);
    const to = localToUtc(addDays(input.date, 1), 0, input.timezone);
    const blocks = await this.blockRepository.findByUserInRange(input.userId, from, to);

    return buildDayPlan(input.date, blocks, input.timezone, availability.dailyLimitMinutes);
  }
}
