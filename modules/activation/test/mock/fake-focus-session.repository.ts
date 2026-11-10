import { FocusSession, FocusSessionRepository } from "../../src";

export class FakeFocusSessionRepository implements FocusSessionRepository {
  private readonly storage = new Map<string, FocusSession>();

  constructor(initialSessions: FocusSession[] = []) {
    for (const session of initialSessions) {
      this.storage.set(session.id, session);
    }
  }

  get sessions(): FocusSession[] {
    return Array.from(this.storage.values());
  }

  async create(data: FocusSession): Promise<FocusSession> {
    this.storage.set(data.id, data);
    return data;
  }

  async findAllByUserAndStep(
    userId: string,
    stepId: string,
  ): Promise<FocusSession[]> {
    return this.sessions.filter(
      (session) => session.userId === userId && session.stepId === stepId,
    );
  }
}
