import { WeeklyAvailability } from "../model";

/** Uma disponibilidade por usuário. Toda operação é escopada pelo `userId`. */
export interface WeeklyAvailabilityRepository {
  findByUser(userId: string): Promise<WeeklyAvailability | null>;
  /** Cria ou substitui a disponibilidade do `availability.userId`. */
  save(availability: WeeklyAvailability): Promise<WeeklyAvailability>;
}
