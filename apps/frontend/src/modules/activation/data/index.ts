import { repositories } from "@/modules/core/data/composition";
import type { ActivationRepository } from "./activation.repository";

export type { ActivationRepository } from "./activation.repository";
export * from "./activation.types";

// Exemplo ou HTTP, escolhido no ponto único de composição (core/data/composition.ts).
export const activationRepository: ActivationRepository = repositories.activation;
