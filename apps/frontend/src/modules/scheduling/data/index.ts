import { ExampleSchedulingRepository } from "./example-scheduling.repository";
import type { SchedulingRepository } from "./scheduling.repository";

export type { SchedulingRepository } from "./scheduling.repository";
export * from "./scheduling.types";

// Etapa D: trocar pela implementação HTTP, sem mudar as telas.
export const schedulingRepository: SchedulingRepository = new ExampleSchedulingRepository();
