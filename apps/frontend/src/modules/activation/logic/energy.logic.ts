import type { BrotoMood } from "@/modules/landing/components/broto.component";
import type { EnergyLevel } from "../data/activation.types";

// Check-in de energia do Hoje (AppHoje.dc.html), com o 4º chip "Elétrico" (P14).
// Os textos de "alta" e "elétrico" seguem a tabela do P14 (Alta → Micro-passo, Elétrico → Foco).
export const ENERGY_CHIPS: { level: EnergyLevel; label: string; icon: string }[] = [
  { level: "low", label: "Baixa", icon: "battery-low" },
  { level: "medium", label: "Média", icon: "battery-medium" },
  { level: "high", label: "Alta", icon: "battery-full" },
  { level: "electric", label: "Elétrico", icon: "lightning" },
];

const MESSAGES: Record<EnergyLevel, string> = {
  low: "Rampa leve hoje, aquecimento mais longo. Tarefas leves à mão.",
  medium: "Rampa padrão de 25 min.",
  high: "Bora! Pulo direto pro micro-passo.",
  electric: "Bora! Direto pro foco.",
};

const HERO: Record<EnergyLevel, string> = {
  low: "Rampa leve até o foco",
  medium: "Rampa de 25 min até o foco",
  high: "Direto pro micro-passo · 25 min de foco",
  electric: "Direto pro foco · 25 min de foco",
};

export const energyMessage = (e: EnergyLevel | null) => (e ? MESSAGES[e] : "Conta pra mim antes de começar.");
export const heroSubtitle = (e: EnergyLevel | null) => (e ? HERO[e] : HERO.medium);

export const energyBrotoMood = (e: EnergyLevel | null): BrotoMood =>
  e === "low" ? "sonolento" : e === "high" || e === "electric" ? "animado" : "ok";

/** Sem check-in, a rampa começa no Aquecer, como no protótipo (pendência registrada no relatório B4). */
export const energyForRamp = (e: EnergyLevel | null): EnergyLevel => e ?? "low";
