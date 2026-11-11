import { CreateRepository } from "@oitenta/shared";
import { FocusSession } from "../model";

export interface FocusSessionRepository extends CreateRepository<FocusSession> {
  findAllByUserAndStep(userId: string, stepId: string): Promise<FocusSession[]>;
}
