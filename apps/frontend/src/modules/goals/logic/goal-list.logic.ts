import { dayLabel, formatDdMm, formatHm, localDate } from "@/modules/core/format/time.format";
import type { GoalListItem, GoalStepDetail } from "../data/goals.types";

// W21 lista de objetivos (AppObjetivos.dc.html, lista): prazo, próxima etapa, % e folga de cada objetivo.
// O "tipo" do protótipo (Entrega, Prova, Publicar) não existe no contrato: usa "Entrega", como a trilha (W22).
export interface GoalCardView {
  kindLabel: string;
  nextLine: string;
  folgaLine: string;
  late: boolean;
}

function folgaLine({ deadline, slackDays, status }: GoalListItem): string {
  if (status === "done") return "Entregue com folga";
  if (!deadline) return "Sem prazo";
  if (slackDays == null) return "Folga a calcular";
  if (slackDays < 0) return `Não cabe até ${formatDdMm(deadline)}`;
  if (slackDays === 0) return "Sem folga";
  return `Folga de ${String(slackDays).replace(".", ",")} ${slackDays > 1 ? "dias" : "dia"}`;
}

/** Monta o cartão de um objetivo a partir de GET /goals (item) e GET /goals/:goalId (etapas com nextBlock). */
export function goalCardView(item: GoalListItem, steps: GoalStepDetail[], today: string, tz: string): GoalCardView {
  const next = steps
    .filter((s) => s.status !== "done" && s.nextBlock)
    .sort((a, b) => a.nextBlock!.start.localeCompare(b.nextBlock!.start))[0];
  const nextLine = next
    ? `Próxima: ${next.title} · ${dayLabel(localDate(next.nextBlock!.start, tz), today).toLowerCase()} às ${formatHm(next.nextBlock!.start, tz)}`
    : item.status === "done"
      ? "Tudo pronto"
      : "Sem etapas agendadas";
  return {
    kindLabel: item.deadline ? `Entrega · ${formatDdMm(item.deadline)}` : "Sem prazo",
    nextLine,
    folgaLine: folgaLine(item),
    late: item.status !== "done" && item.slackDays != null && item.slackDays < 0,
  };
}

export function activeCountLabel(goals: GoalListItem[]): string {
  const n = goals.filter((g) => g.status === "active").length;
  return `${n} ${n === 1 ? "ativo" : "ativos"}`;
}
