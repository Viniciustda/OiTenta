import { repositories } from "@/modules/core/data/composition";
import type { GoalsRepository } from "./goals.repository";

export type { GoalsRepository } from "./goals.repository";
export * from "./goals.types";

// Exemplo ou HTTP, escolhido no ponto único de composição (core/data/composition.ts).
export const goalsRepository: GoalsRepository = repositories.goals;
