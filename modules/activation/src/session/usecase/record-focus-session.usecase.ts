import { UseCase } from "@oitenta/shared";
import { AvailableTime, EnergyLevel } from "../../ramp/model";
import { FocusSession, FocusSessionOutcome } from "../model";
import { FocusSessionRepository } from "../provider";

export interface RecordFocusSessionIn {
  userId: string;
  goalId: string;
  stepId: string;
  blockId?: string | null;
  energy: EnergyLevel;
  availableTime?: AvailableTime | null;
  startedAt: Date;
  endedAt: Date;
  focusedMinutes: number;
  outcome: FocusSessionOutcome;
  partialPct?: number | null;
}

export interface RecordFocusSessionOut {
  session: FocusSession;
}

export class RecordFocusSession
  implements UseCase<RecordFocusSessionIn, RecordFocusSessionOut>
{
  constructor(
    private readonly focusSessionRepository: FocusSessionRepository,
  ) {}

  async execute(input: RecordFocusSessionIn): Promise<RecordFocusSessionOut> {
    const session = new FocusSession({
      userId: input.userId,
      goalId: input.goalId,
      stepId: input.stepId,
      blockId: input.blockId ?? null,
      energy: input.energy,
      availableTime: input.availableTime ?? null,
      startedAt: input.startedAt,
      endedAt: input.endedAt,
      focusedMinutes: input.focusedMinutes,
      outcome: input.outcome,
      partialPct: input.partialPct ?? null,
    });
    session.validate();

    await this.focusSessionRepository.create(session);

    return { session };
  }
}
