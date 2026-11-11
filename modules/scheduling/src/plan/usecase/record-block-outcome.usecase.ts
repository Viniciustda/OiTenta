import { InRule, NotFoundError, RequiredRule, UseCase, Validator } from "@oitenta/shared";
import { ScheduledBlock } from "../model";
import { ScheduledBlockRepository } from "../provider";

export const BLOCK_OUTCOMES = ["done", "partial", "missed"] as const;
export type BlockOutcome = (typeof BLOCK_OUTCOMES)[number];

export interface RecordBlockOutcomeIn {
  userId: string;
  blockId: string;
  outcome: BlockOutcome;
}

export interface RecordBlockOutcomeOut {
  block: ScheduledBlock;
}

export class RecordBlockOutcome
  implements UseCase<RecordBlockOutcomeIn, RecordBlockOutcomeOut>
{
  constructor(private readonly blockRepository: ScheduledBlockRepository) {}

  async execute(input: RecordBlockOutcomeIn): Promise<RecordBlockOutcomeOut> {
    Validator.validate([
      { code: "blockOutcome.outcome", value: input.outcome, rules: [new RequiredRule(), new InRule([...BLOCK_OUTCOMES])] },
    ]);

    const existing = await this.blockRepository.findById(input.userId, input.blockId);
    if (!existing) {
      throw new NotFoundError("Bloco não encontrado.");
    }

    const block = existing.clone({ status: input.outcome });
    block.validate();
    await this.blockRepository.update(block);

    return { block };
  }
}
