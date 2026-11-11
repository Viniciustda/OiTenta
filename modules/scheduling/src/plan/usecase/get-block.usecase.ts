import { NotFoundError, UseCase } from "@oitenta/shared";
import { ScheduledBlock } from "../model";
import { ScheduledBlockRepository } from "../provider";

export interface GetBlockIn {
  userId: string;
  blockId: string;
}

export interface GetBlockOut {
  block: ScheduledBlock;
}

/** Lê um bloco do usuário; bloco de outro usuário ou inexistente → `NotFoundError`. */
export class GetBlock implements UseCase<GetBlockIn, GetBlockOut> {
  constructor(private readonly blockRepository: ScheduledBlockRepository) {}

  async execute(input: GetBlockIn): Promise<GetBlockOut> {
    const block = await this.blockRepository.findById(input.userId, input.blockId);
    if (!block) {
      throw new NotFoundError("Bloco não encontrado.");
    }

    return { block };
  }
}
