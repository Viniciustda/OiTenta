import { repositories } from "@/modules/core/data/composition";
import type { GoalAssistantRepository } from "./goal-assistant.repository";
import type { GoalsRepository } from "./goals.repository";

export type { GoalAssistantRepository } from "./goal-assistant.repository";
export type { GoalsRepository } from "./goals.repository";
export * from "./goals.types";

// Exemplo ou HTTP, escolhido no ponto único de composição (core/data/composition.ts).
export const goalsRepository: GoalsRepository = repositories.goals;
export const goalAssistantRepository: GoalAssistantRepository = repositories.goalAssistant;
