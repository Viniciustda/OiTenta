import type { ActivationRepository } from "./activation.repository";
import { ExampleActivationRepository } from "./example-activation.repository";

export type { ActivationRepository } from "./activation.repository";
export * from "./activation.types";

// Etapa D: trocar pela implementação HTTP, sem mudar as telas.
export const activationRepository: ActivationRepository = new ExampleActivationRepository();
