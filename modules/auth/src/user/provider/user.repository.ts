import { CreateRepository, FindByIdRepository } from "@oitenta/shared";
import { User } from "../model";

export interface UserRepository
  extends CreateRepository<User>,
    FindByIdRepository<User> {
  findByEmail(email: string): Promise<User | null>;
}
