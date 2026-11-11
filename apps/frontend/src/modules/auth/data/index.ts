import type { AuthRepository } from "./auth.repository";
import { ExampleAuthRepository } from "./example-auth.repository";

export type { AuthRepository } from "./auth.repository";
export * from "./auth.types";

// Etapa D: trocar pela implementação HTTP, sem mudar as telas.
export const authRepository: AuthRepository = new ExampleAuthRepository();
