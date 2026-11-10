import { CreateRepository, UpdateRepository } from "@oitenta/shared";
import { Goal } from "../model";

export interface GoalRepository
  extends CreateRepository<Goal>,
    UpdateRepository<Goal> {
  findById(userId: string, goalId: string): Promise<Goal | null>;
  findAllByUser(userId: string): Promise<Goal[]>;
}
