import { repositories } from "@/modules/core/data/composition";
import type { SchedulingRepository } from "./scheduling.repository";

export type { SchedulingRepository } from "./scheduling.repository";
export * from "./scheduling.types";

// Exemplo ou HTTP, escolhido no ponto único de composição (core/data/composition.ts).
export const schedulingRepository: SchedulingRepository = repositories.scheduling;
