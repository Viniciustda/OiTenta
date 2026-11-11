// Barra gamificada e conquistas com os valores fixos do protótipo (P18): sem lógica e sem endpoint.
// Quando o módulo gamification existir, só a fonte destes números muda.
export const GAMIFICATION = {
  streak: 6,
  drops: 340,
  level: 7,
  xp: 410,
  xpNeeded: 480,
  stage: "broto" as const,
  stageLabel: "Broto · Nv 7",
};

export type BadgeState = "on" | "rare" | "lock";

export const RECENT_BADGES: { name: string; sub: string; icon: string; state: BadgeState }[] = [
  { name: "Rampa completa", sub: "Rara · 8% dos usuários", icon: "ph-fill ph-flag-checkered", state: "rare" },
  { name: "Primeiro passo", sub: "Desbloqueada 03/11", icon: "ph-fill ph-footprints", state: "on" },
  { name: "7 dias regados", sub: "6 de 7", icon: "ph ph-lock-simple", state: "lock" },
];

/** Valores fixos da celebração da rampa (W41). */
export const CELEBRATION = {
  dropsDone: 20,
  dropsPartial: 10,
  rampDrops: 20,
  focusXp: 1,
};

/** Conquista rara mostrada depois da sessão (W40; Bora App.dc.html, marco "7 dias regados"). */
export const MILESTONE = {
  kicker: "Conquista rara",
  title: "7 dias regados",
  sub: "Uma semana inteira cuidando do Broto. Ele tá orgulhoso de você.",
};
