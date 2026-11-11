import type { Preferences, Theme } from "./settings.types";

// Fronteira da tela de configurações com as preferências do usuário. Não há endpoint no contrato
// (docs/4-contrato-api.md): hoje só existe a implementação de exemplo; quando houver, entra uma HTTP.
export interface SettingsRepository {
  getPreferences(): Promise<Preferences>;
  setTheme(theme: Theme): Promise<Preferences>;
  setDailyEmail(on: boolean): Promise<Preferences>;
}
