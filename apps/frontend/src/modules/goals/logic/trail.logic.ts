import { dayLabel, formatDuration, formatHm, localDate } from "@/modules/core/format/time.format";
import type { GoalStepDetail } from "../data/goals.types";

// Trilha das etapas (AppObjetivos.dc.html, detalhe).
export type TrailState = "done" | "next" | "partial" | "pending";

export interface TrailStepView {
  state: TrailState;
  meta: string;
  pill: string | null;
  partialPct: number;
}

export function stepView(s: GoalStepDetail, isNext: boolean, today: string, tz: string): TrailStepView {
  if (s.status === "done") return { state: "done", meta: `Concluída · ${formatDuration(s.estimatedMinutes)}`, pill: null, partialPct: 100 };
  const nb = s.nextBlock;
  const day = nb ? dayLabel(localDate(nb.start, tz), today) : null;
  const when = nb ? `${day} ${formatHm(nb.start, tz)}` : "Ainda sem horário";
  const partial = s.progressPct > 0;
  return {
    state: partial ? "partial" : isNext ? "next" : "pending",
    meta: `${when} · ${formatDuration(s.estimatedMinutes)}`,
    pill: nb ? (day === "Hoje" ? `Hoje ${formatHm(nb.start, tz)}` : day) : null,
    partialPct: s.progressPct,
  };
}

export function slackShort(v: number | null): string {
  if (v == null) return "—";
  if (v < 0) return "Não cabe";
  if (v === 0) return "0 dia";
  return `${String(v).replace(".", ",")} ${v > 1 ? "dias" : "dia"}`;
}
