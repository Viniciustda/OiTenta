import { UpdateRepository } from "@oitenta/shared";
import { ScheduledBlock } from "../model";

export interface ScheduledBlockRepository extends UpdateRepository<ScheduledBlock> {
  /** Blocos do usuário com `from <= start < to`, em ordem de início. */
  findByUserInRange(userId: string, from: Date, to: Date): Promise<ScheduledBlock[]>;
  findById(userId: string, blockId: string): Promise<ScheduledBlock | null>;
  /**
   * Apaga só os blocos do usuário com `start >= from` que são `planned`,
   * não `pinned` e `auto`, e grava os novos (D 4g). O `update` filtra por
   * `block.userId` e `block.id`.
   */
  replaceFutureAutoBlocks(userId: string, from: Date, blocks: ScheduledBlock[]): Promise<void>;
}
