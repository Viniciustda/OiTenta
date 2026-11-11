import { UseCase } from "@oitenta/shared";
import { ScheduledBlock } from "../model";
import { ScheduledBlockRepository } from "../provider";

/** Quanto à frente o próximo bloco de cada etapa é procurado. */
export const NEXT_BLOCKS_HORIZON_DAYS = 366;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface GetNextBlocksIn {
  userId: string;
  goalId: string;
  now: Date;
}

export interface NextBlockView {
  id: string;
  start: Date;
  end: Date;
}

export interface GetNextBlocksOut {
  /** Próximo bloco `planned` de cada etapa; etapa sem bloco fica fora do mapa. */
  byStep: Record<string, NextBlockView>;
}

function compareBlocks(a: ScheduledBlock, b: ScheduledBlock): number {
  return (
    a.start.getTime() - b.start.getTime() ||
    a.end.getTime() - b.end.getTime() ||
    a.id.localeCompare(b.id)
  );
}

/** Próximo bloco planejado (início ≥ agora) de cada etapa de um objetivo do usuário. */
export class GetNextBlocks implements UseCase<GetNextBlocksIn, GetNextBlocksOut> {
  constructor(private readonly blockRepository: ScheduledBlockRepository) {}

  async execute(input: GetNextBlocksIn): Promise<GetNextBlocksOut> {
    const to = new Date(input.now.getTime() + NEXT_BLOCKS_HORIZON_DAYS * DAY_MS);
    const blocks = await this.blockRepository.findByUserInRange(input.userId, input.now, to);

    const byStep: Record<string, NextBlockView> = {};
    blocks
      .filter(
        (block) =>
          block.goalId === input.goalId && block.status === "planned" && block.start >= input.now,
      )
      .sort(compareBlocks)
      .forEach((block) => {
        byStep[block.stepId] ??= { id: block.id, start: block.start, end: block.end };
      });

    return { byStep };
  }
}
