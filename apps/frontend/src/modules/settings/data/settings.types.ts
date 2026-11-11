// Preferências da tela W26 (AppConfig.dc.html) que o contrato não cobre: tema e e-mail diário.
export type Theme = "light" | "dark";

export interface Preferences {
  theme: Theme;
  dailyEmail: boolean;
}
