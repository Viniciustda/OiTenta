import { ScheduledBlock, ScheduledBlockRepository } from "../../src";

export class FakeScheduledBlockRepository implements ScheduledBlockRepository {
  private storage: ScheduledBlock[];
  writeCalls = 0;

  constructor(initial: ScheduledBlock[] = []) {
    this.storage = [...initial];
  }

  get blocks(): ScheduledBlock[] {
    return [...this.storage];
  }

  async findByUserInRange(userId: string, from: Date, to: Date): Promise<ScheduledBlock[]> {
    return this.storage
      .filter((block) => block.userId === userId && block.start >= from && block.start < to)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  async findById(userId: string, blockId: string): Promise<ScheduledBlock | null> {
    return this.storage.find((block) => block.userId === userId && block.id === blockId) ?? null;
  }

  async update(data: ScheduledBlock): Promise<ScheduledBlock> {
    this.writeCalls++;
    const index = this.storage.findIndex(
      (block) => block.userId === data.userId && block.id === data.id,
    );
    if (index < 0) {
      throw new Error("Bloco não encontrado.");
    }
    this.storage[index] = data;
    return data;
  }

  async replaceFutureAutoBlocks(
    userId: string,
    from: Date,
    blocks: ScheduledBlock[],
  ): Promise<void> {
    this.writeCalls++;
    this.storage = this.storage.filter(
      (block) =>
        !(
          block.userId === userId &&
          block.start >= from &&
          block.status === "planned" &&
          !block.pinned &&
          block.origin === "auto"
        ),
    );
    this.storage.push(...blocks);
  }
}
