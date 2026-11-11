import { Commitment, CommitmentRepository } from "../../src";

export class FakeCommitmentRepository implements CommitmentRepository {
  constructor(private readonly commitments: Commitment[] = []) {}

  async findAllByUser(userId: string): Promise<Commitment[]> {
    return this.commitments.filter((commitment) => commitment.userId === userId);
  }
}
