import { UseCase, Validator } from "@oitenta/shared";
import { addDays, localDateRules, localToUtc } from "../../common";
import { ScheduledBlock } from "../model";
import { ScheduledBlockRepository } from "../provider";

export interface GetDayPlanIn {
  userId: string;
  /** Data local `YYYY-MM-DD`. */
  date: string;
  timezone: string;
}

export interface GetDayPlanOut {
  blocks: ScheduledBlock[];
}

/** Blocos que começam no dia local pedido (P13), em ordem de início. */
export class GetDayPlan implements UseCase<GetDayPlanIn, GetDayPlanOut> {
  constructor(private readonly blockRepository: ScheduledBlockRepository) {}

  async execute(input: GetDayPlanIn): Promise<GetDayPlanOut> {
    Validator.validate([{ code: "dayPlan.date", value: input.date, rules: localDateRules() }]);

    const from = localToUtc(input.date, 0, input.timezone);
    const to = localToUtc(addDays(input.date, 1), 0, input.timezone);
    const blocks = await this.blockRepository.findByUserInRange(input.userId, from, to);

    return { blocks: [...blocks].sort((a, b) => a.start.getTime() - b.start.getTime()) };
  }
}
