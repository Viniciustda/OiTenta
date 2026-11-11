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

// ---------- W25 Jardim (AppJardim.dc.html), valores fixos do protótipo (P18) ----------
// example: sem endpoint de gamificação no contrato (docs/4-contrato-api.md). Quando houver, só a fonte muda.

export type GardenDayState = "watered" | "protected" | "pending";
export type HeatCell = { level: 0 | 1 | 2 | 3 | 4; today: boolean };

/** Nível, XP e estágio (protótipo: Nv 7, 410/480 XP, estágio Broto, hoje ainda sem rega). */
export const GARDEN = {
  level: GAMIFICATION.level,
  xp: GAMIFICATION.xp,
  xpNeeded: GAMIFICATION.xpNeeded,
  stage: GAMIFICATION.stage,
  stageName: "Broto",
  streak: GAMIFICATION.streak,
  wateredToday: false,
  umbrellas: 1,
  umbrellaPrice: 50,
  drops: GAMIFICATION.drops,
};

export const GARDEN_STAGES: { id: "semente" | "broto" | "muda" | "arbusto" | "arvore"; name: string; levels: string }[] = [
  { id: "semente", name: "Semente", levels: "Nv 1–3" },
  { id: "broto", name: "Broto", levels: "Nv 4–8" },
  { id: "muda", name: "Muda", levels: "Nv 9–14" },
  { id: "arbusto", name: "Arbusto", levels: "Nv 15–24" },
  { id: "arvore", name: "Árvore jovem", levels: "Nv 25+" },
];

/** Últimos 7 dias (o 3º protegido pelo guarda-chuva; o último é hoje). */
export const GARDEN_WEEK: { label: string; state: GardenDayState }[] = ["T", "Q", "Q", "S", "S", "D", "Hoje"].map((label, i) => ({
  label,
  state: i === 6 ? (GARDEN.wateredToday ? "watered" : "pending") : i === 2 ? "protected" : "watered",
}));

/** Mapa das últimas 12 semanas: 12 colunas × 7 dias, com a mesma fórmula fixa do protótipo. */
export const GARDEN_HEAT: HeatCell[][] = Array.from({ length: 12 }, (_, w) =>
  Array.from({ length: 7 }, (_, d) => {
    const idx = w * 7 + d;
    const last = 83;
    if (idx === last) return { level: GARDEN.wateredToday ? 3 : 0, today: true };
    const recent = idx >= last - 6;
    const level = recent ? (idx === last - 4 ? 1 : 2 + (idx % 3 === 0 ? 1 : 0)) : [0, 1, 2, 0, 3, 1, 0, 2, 4, 1, 0, 2][(idx * 7 + w) % 12];
    return { level: level as HeatCell["level"], today: false };
  }),
);

export const GARDEN_BADGES: { name: string; sub: string; icon: string; state: BadgeState }[] = [
  { name: "Primeiro passo", sub: "1º degrau · 03/11", icon: "ph-fill ph-footprints", state: "on" },
  { name: "Rampa completa", sub: "Rara · 8% dos usuários", icon: "ph-fill ph-flag-checkered", state: "rare" },
  { name: "Voltou da pausa", sub: "Retomou com mini-degrau", icon: "ph-fill ph-arrow-counter-clockwise", state: "on" },
  { name: "7 dias regados", sub: `${GAMIFICATION.streak} de 7`, icon: "ph ph-lock-simple", state: "lock" },
  { name: "Entregue com folga", sub: "Entrega ≥1 dia antes", icon: "ph ph-lock-simple", state: "lock" },
];
