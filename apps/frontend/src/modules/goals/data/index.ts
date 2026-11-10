import { ExampleGoalsRepository } from "./example-goals.repository";
import type { GoalsRepository } from "./goals.repository";

export type { GoalsRepository } from "./goals.repository";
export * from "./goals.types";

// Etapa D: trocar pela implementação HTTP, sem mudar as telas.
export const goalsRepository: GoalsRepository = new ExampleGoalsRepository();
