import { Goal, GoalRepository } from "../../src";

export class FakeGoalRepository implements GoalRepository {
  private readonly storage = new Map<string, Goal>();
  createCalls = 0;
  updateCalls = 0;

  constructor(initialGoals: Goal[] = []) {
    for (const goal of initialGoals) {
      this.storage.set(goal.id, goal);
    }
  }

  get goals(): Goal[] {
    return Array.from(this.storage.values());
  }

  async create(data: Goal): Promise<Goal> {
    this.createCalls += 1;
    this.storage.set(data.id, data);
    return data;
  }

  async update(data: Goal): Promise<Goal> {
    const current = this.storage.get(data.id);
    if (!current || current.userId !== data.userId) {
      throw new Error("Objetivo não encontrado para este usuário.");
    }
    this.updateCalls += 1;
    this.storage.set(data.id, data);
    return data;
  }

  async findById(userId: string, goalId: string): Promise<Goal | null> {
    const goal = this.storage.get(goalId);
    return goal && goal.userId === userId ? goal : null;
  }

  async findAllByUser(userId: string): Promise<Goal[]> {
    return this.goals.filter((goal) => goal.userId === userId);
  }
}
