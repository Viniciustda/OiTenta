import { NotFoundError, UseCase } from "@oitenta/shared";
import { WeeklyAvailability } from "../model";
import { WeeklyAvailabilityRepository } from "../provider";

export interface GetWeeklyAvailabilityIn {
  userId: string;
}

export interface GetWeeklyAvailabilityOut {
  availability: WeeklyAvailability;
}

export class GetWeeklyAvailability
  implements UseCase<GetWeeklyAvailabilityIn, GetWeeklyAvailabilityOut>
{
  constructor(private readonly availabilityRepository: WeeklyAvailabilityRepository) {}

  async execute(input: GetWeeklyAvailabilityIn): Promise<GetWeeklyAvailabilityOut> {
    const availability = await this.availabilityRepository.findByUser(input.userId);
    if (!availability) {
      throw new NotFoundError("Disponibilidade não encontrada.");
    }

    return { availability };
  }
}
