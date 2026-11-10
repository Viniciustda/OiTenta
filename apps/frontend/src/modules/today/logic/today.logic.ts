import { formatDdMm, formatDuration, formatHm, localDate, minutesBetween } from "@/modules/core/format/time.format";
import type { PlanBlock } from "@/modules/scheduling/data/scheduling.types";

// Regras de exibição do Hoje (AppHoje.dc.html).
export type TimelineItem =
  | { kind: "now"; key: string; time: string }
  | { kind: "block"; key: string; time: string; block: PlanBlock; done: boolean; isNext: boolean; pill: string; duration: string };

const pending = (blocks: PlanBlock[]) => blocks.filter((b) => b.status === "planned");

export const nextBlock = (blocks: PlanBlock[]) => pending(blocks)[0] ?? null;

export function daySummary(blocks: PlanBlock[]): string {
  const p = pending(blocks);
  if (!p.length) return "Tudo feito por hoje. Quer adiantar alguma coisa?";
  const total = p.reduce((a, b) => a + minutesBetween(b.start, b.end), 0);
  return `${p.length} ${p.length > 1 ? "etapas" : "etapa"} hoje · ${formatDuration(total)} de foco planejado. O resto da noite é seu.`;
}

export function nextLine(b: PlanBlock | null, now: string, tz: string): string {
  if (!b) return "Nada agendado";
  const when = localDate(b.start, tz) === localDate(now, tz) ? "hoje" : formatDdMm(localDate(b.start, tz));
  return `Próxima: ${b.stepTitle} · ${when} às ${formatHm(b.start, tz)}`;
}

export function buildTimeline(blocks: PlanBlock[], now: string, tz: string): TimelineItem[] {
  const next = nextBlock(blocks);
  const items: (TimelineItem & { at: string })[] = [
    { kind: "now", key: "now", time: formatHm(now, tz), at: now },
    ...blocks.map((b) => {
      const done = b.status === "done";
      const isNext = next?.id === b.id;
      const t = formatHm(b.start, tz);
      return {
        kind: "block" as const, key: b.id, time: t, at: b.start, block: b, done, isNext,
        pill: done ? "Concluída" : isNext ? `Próxima · ${t}` : `Hoje ${t}`,
        duration: formatDuration(minutesBetween(b.start, b.end)),
      };
    }),
  ];
  // O "Agora" vem antes de um bloco que começa no mesmo instante (protótipo).
  items.sort((a, b) => a.at.localeCompare(b.at) || (a.kind === "now" ? -1 : 1));
  return items.map(({ at: _at, ...i }) => i as TimelineItem);
}

/** Saudação do protótipo (texto fixo; ver pendências do relatório B4). */
export const greeting = (name: string) => `Boa noite, ${name}`;

/** "Entrega 20/11 · folga de 2 dias" (o tipo "Entrega" é fixo: o contrato não tem o tipo do prazo). */
export function goalMeta({ deadline, slackDays }: { deadline: string | null; slackDays: number | null }): string {
  if (!deadline) return "Sem prazo";
  if (slackDays != null && slackDays < 0) return `Não cabe até ${formatDdMm(deadline)}`;
  return `Entrega ${formatDdMm(deadline)} · ${slackLabel(slackDays)}`;
}

export function slackLabel(v: number | null): string {
  if (v == null) return "folga a calcular";
  if (v < 0) return "não cabe até o prazo";
  if (v === 0) return "sem folga";
  return `folga de ${String(v).replace(".", ",")} ${v > 1 ? "dias" : "dia"}`;
}
