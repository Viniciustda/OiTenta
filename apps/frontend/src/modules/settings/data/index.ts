import { repositories } from "@/modules/core/data/composition";
import type { SettingsRepository } from "./settings.repository";

export type { SettingsRepository } from "./settings.repository";
export * from "./settings.types";

// Escolhido no ponto único de composição (core/data/composition.ts). Hoje é sempre o de exemplo.
export const settingsRepository: SettingsRepository = repositories.settings;
