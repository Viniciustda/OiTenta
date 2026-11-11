import { repositories } from "@/modules/core/data/composition";
import type { AuthRepository } from "./auth.repository";

export type { AuthRepository } from "./auth.repository";
export * from "./auth.types";

// Exemplo ou HTTP, escolhido no ponto único de composição (core/data/composition.ts).
export const authRepository: AuthRepository = repositories.auth;
