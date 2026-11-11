import { WeeklyAvailability, WeeklyAvailabilityRepository } from "../../src";

export class FakeWeeklyAvailabilityRepository implements WeeklyAvailabilityRepository {
  private readonly storage = new Map<string, WeeklyAvailability>();
  saveCalls = 0;

  constructor(initial: WeeklyAvailability[] = []) {
    for (const availability of initial) {
      this.storage.set(availability.userId, availability);
    }
  }

  get all(): WeeklyAvailability[] {
    return Array.from(this.storage.values());
  }

  async findByUser(userId: string): Promise<WeeklyAvailability | null> {
    return this.storage.get(userId) ?? null;
  }

  async save(availability: WeeklyAvailability): Promise<WeeklyAvailability> {
    this.saveCalls++;
    this.storage.set(availability.userId, availability);
    return availability;
  }
}
