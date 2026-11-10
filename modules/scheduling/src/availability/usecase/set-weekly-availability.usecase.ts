import { UseCase } from "@oitenta/shared";
import { AvailabilityWindow, mergeTouchingWindows, WeeklyAvailability } from "../model";
import { WeeklyAvailabilityRepository } from "../provider";

export interface SetWeeklyAvailabilityIn {
  userId: string;
  windows: AvailabilityWindow[];
  dailyLimitMinutes: number;
}

export interface SetWeeklyAvailabilityOut {
  availability: WeeklyAvailability;
}

/** Cria ou substitui a disponibilidade semanal do usuário (uma por usuário). */
export class SetWeeklyAvailability
  implements UseCase<SetWeeklyAvailabilityIn, SetWeeklyAvailabilityOut>
{
  constructor(private readonly availabilityRepository: WeeklyAvailabilityRepository) {}

  async execute(input: SetWeeklyAvailabilityIn): Promise<SetWeeklyAvailabilityOut> {
    // Valida as janelas como vieram: unir antes esconderia janela invertida ou vazia.
    new WeeklyAvailability({
      userId: input.userId,
      windows: input.windows,
      dailyLimitMinutes: input.dailyLimitMinutes,
    }).validate();

    const windows = mergeTouchingWindows(input.windows);
    const existing = await this.availabilityRepository.findByUser(input.userId);
    const availability = existing
      ? existing.clone({ windows, dailyLimitMinutes: input.dailyLimitMinutes })
      : new WeeklyAvailability({
          userId: input.userId,
          windows,
          dailyLimitMinutes: input.dailyLimitMinutes,
        });
    availability.validate();

    await this.availabilityRepository.save(availability);

    return { availability };
  }
}
