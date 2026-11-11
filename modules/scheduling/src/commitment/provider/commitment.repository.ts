import { Commitment } from "../model";

export interface CommitmentRepository {
  findAllByUser(userId: string): Promise<Commitment[]>;
}
