import { dayLabel, daysBetween, formatDdMm, formatDuration, formatHm, localDate, localMinute, minutesBetween, monthName, addDays, dayOfMonth, weekdayIndex, weekdayLong, weekdayShort } from "@/modules/core/format/time.format";
import type { AvailabilityWindow } from "../data/scheduling.types";

// Geometria e rótulos do calendário semanal (AppCalendario.dc.html): 08h–23h, 40 px por hora.
export const HOUR_HEIGHT = 40;
export const FIRST_MINUTE = 8 * 60;
export const GRID_HOURS_COUNT = 15;
/** Fundo das faixas livres da grade e da legenda. */
export const FREE_BG = "var(--free)";

const toTop = (minute: number) => ((minute - FIRST_MINUTE) / 60) * HOUR_HEIGHT;

export function weekRangeLabel(monday: string): string {
  const sunday = addDays(monday, 6);
  if (monday.slice(5, 7) === sunday.slice(5, 7)) return `${dayOfMonth(monday)}–${dayOfMonth(sunday)} de ${monthName(monday)}`;
  return `${dayOfMonth(monday)} ${monthName(monday).slice(0, 3)} – ${dayOfMonth(sunday)} ${monthName(sunday).slice(0, 3)}`;
}

export const dayLoadLabel = (used: number, limit: number) => (used ? `${formatDuration(used)} de ${formatDuration(limit)}` : "livre");

export function blockGeometry(start: string, end: string, tz: string) {
  const minutes = minutesBetween(start, end);
  return { top: toTop(localMinute(start, tz)) + 1, height: Math.max(20, (minutes / 60) * HOUR_HEIGHT - 3) };
}

export const freeRects = (windows: AvailabilityWindow[], weekday: number) =>
  windows
    .filter((w) => w.weekday === weekday)
    .map((w) => ({ top: toTop(Math.max(FIRST_MINUTE, w.startMinute)), height: ((w.endMinute - Math.max(FIRST_MINUTE, w.startMinute)) / 60) * HOUR_HEIGHT }));

export function blockDetail(b: { start: string; end: string }, today: string, tz: string) {
  const date = localDate(b.start, tz);
  const label = dayLabel(date, today);
  const day = label === "Hoje" || label === "Amanhã" ? `${label}, ${formatDdMm(date)}` : label;
  return { when: `${day} · ${formatHm(b.start, tz)}–${formatHm(b.end, tz)}`, duration: formatDuration(minutesBetween(b.start, b.end)) };
}

// ---------- Dia / Semana / Mês × Execução / Prazos (W17–W20, AppCalendario.dc.html) ----------

export type CalendarView = "dia" | "semana" | "mes";
export type CalendarMode = "exec" | "prazos";

/** Horizonte de navegação do protótipo: 4 semanas a partir de hoje (week 0–3, day 0–27); o mês não navega. */
export const HORIZON_DAYS = 28;
export const HORIZON_WEEKS = 4;
/**
 * Objetivos `done` aparecem em Prazos: o protótipo não os filtra (o detalhe diz "Pronto antes do prazo").
 * Trocar para `false` esconde-os.
 */
export const SHOW_DONE_DEADLINES = true;
/** O contrato não tem o tipo do prazo ("Entrega", "Prova"…); fixo, como em today.logic (goalMeta). */
export const DEADLINE_KIND = "Entrega";
const MONTH_BARS = 3;

export const mondayOf = (date: string) => addDays(date, -weekdayIndex(date));

/** 42 dias (6 semanas) a partir da segunda-feira da semana do dia 1 do mês da data. */
export function monthGridDates(date: string): string[] {
  const first = mondayOf(`${date.slice(0, 8)}01`);
  return Array.from({ length: 42 }, (_, i) => addDays(first, i));
}

export function viewDates(view: CalendarView, anchor: string): string[] {
  if (view === "dia") return [anchor];
  if (view === "mes") return monthGridDates(anchor);
  const monday = mondayOf(anchor);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** Segundas-feiras das semanas que cobrem as datas (o mês é montado com GET /scheduling/plan/week). */
export const weekStarts = (dates: string[]) => [...new Set(dates.map(mondayOf))];

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function rangeLabel(view: CalendarView, anchor: string): string {
  if (view === "dia") return `${weekdayLong(anchor)}, ${formatDdMm(anchor)}`;
  if (view === "mes") return `${capitalize(monthName(anchor))} de ${anchor.slice(0, 4)}`;
  return weekRangeLabel(mondayOf(anchor));
}

/** Rótulo acessível de um dia: "Sex, 20/11". */
export const dayAriaLabel = (date: string) => `${weekdayShort(date)}, ${formatDdMm(date)}`;

export function canNavigate(view: CalendarView, anchor: string, today: string, dir: -1 | 1): boolean {
  if (view === "mes") return false;
  if (view === "semana") {
    const offset = daysBetween(mondayOf(today), mondayOf(anchor)) / 7;
    return dir < 0 ? offset > 0 : offset < HORIZON_WEEKS - 1;
  }
  const offset = daysBetween(today, anchor);
  return dir < 0 ? offset > 0 : offset < HORIZON_DAYS - 1;
}

export const shiftAnchor = (view: CalendarView, anchor: string, dir: -1 | 1) => addDays(anchor, dir * (view === "semana" ? 7 : 1));

/** Semana → Dia: o protótipo abre o primeiro dia da semana (que, na semana atual, é hoje). */
export const dayFromWeek = (weekStart: string, today: string) => (mondayOf(today) === weekStart ? today : weekStart);

export const inHorizon = (date: string, today: string) => {
  const d = daysBetween(today, date);
  return d >= 0 && d < HORIZON_DAYS;
};

export interface DeadlineGoal {
  id: string;
  title: string;
  deadline: string | null;
  status: string;
}

/** Objetivos com prazo final na data (1 item por objetivo), sem os escondidos pelo filtro. */
export const deadlinesOn = <T extends DeadlineGoal>(goals: T[], date: string, hidden: Record<string, boolean>) =>
  goals.filter((g) => g.deadline === date && !hidden[g.id] && (SHOW_DONE_DEADLINES || g.status !== "done"));

export const deadlineCountLabel = (k: number) => (k ? `${k} ${k > 1 ? "entregas" : "entrega"}` : "—");

export function prazosEmptyLabel(view: CalendarView, goals: DeadlineGoal[], lastDate: string, hidden: Record<string, boolean>): string {
  const base = view === "dia" ? "Nenhuma entrega neste dia" : "Nenhuma entrega nesta semana";
  const upcoming = goals
    .filter((g) => g.deadline && g.deadline > lastDate && deadlinesOn([g], g.deadline, hidden).length)
    .sort((a, b) => a.deadline!.localeCompare(b.deadline!))[0];
  return upcoming ? `${base} · próxima: ${upcoming.title} em ${formatDdMm(upcoming.deadline!)}` : base;
}

interface DeadlineDetailGoal extends DeadlineGoal {
  done: number;
  total: number;
  slackDays: number | null;
}
interface DeadlineDetailStep {
  title: string;
  status: string;
  remainingMinutes: number;
  nextBlock?: { start: string };
}

/** Painel "Prazo final" (AppCalendario.dc.html, hasSelObj). */
export function deadlineDetail(goal: DeadlineDetailGoal, steps: DeadlineDetailStep[], today: string, tz: string) {
  const deadline = goal.deadline!;
  const left = daysBetween(today, deadline);
  // Prazo já passado: o protótipo não define o texto; mostra só a data.
  const rel = left === 0 ? " · hoje" : left === 1 ? " · amanhã" : left > 1 ? ` · em ${left} dias` : "";
  const pending = steps.filter((s) => s.status === "pending");
  const remaining = Math.round(pending.reduce((a, s) => a + s.remainingMinutes, 0) / 15) * 15;
  const s = goal.slackDays;
  const late = goal.status !== "done" && s != null && s < 0;
  const folga =
    goal.status === "done" ? "Pronto antes do prazo"
    : late ? `Não cabe até ${formatDdMm(deadline)}`
    : s == null ? "Folga a calcular"
    : s === 0 ? "Sem folga restante"
    : `Folga restante: ${String(s).replace(".", ",")} ${s > 1 ? "dias" : "dia"}`;
  const next = pending
    .filter((x) => x.nextBlock)
    .sort((a, b) => a.nextBlock!.start.localeCompare(b.nextBlock!.start))[0];
  let nextLabel = "Sem etapas agendadas";
  if (next) {
    const label = dayLabel(localDate(next.nextBlock!.start, tz), today);
    nextLabel = `Próxima etapa: ${next.title} · ${label === "Hoje" ? "hoje" : label} às ${formatHm(next.nextBlock!.start, tz)}`;
  }
  return {
    when: `${DEADLINE_KIND} · ${weekdayLong(deadline)}, ${formatDdMm(deadline)}${rel}`,
    etapas: `${goal.done} de ${goal.total} etapas concluídas`,
    restante: remaining ? `Faltam ${formatDuration(remaining)} de execução` : "Nada pendente",
    folga,
    late,
    next: nextLabel,
  };
}

/** "Ver execução": a semana da próxima etapa (ou do prazo), dentro do horizonte de navegação. */
export function verExecucaoWeek(nextStart: string | null, deadline: string, today: string, tz: string): string {
  const target = mondayOf(nextStart ? localDate(nextStart, tz) : deadline);
  const first = mondayOf(today);
  const last = addDays(first, (HORIZON_WEEKS - 1) * 7);
  return target < first ? first : target > last ? last : target;
}

/** Dias passados ficam mais apagados; dias futuros de outro mês, um pouco menos (protótipo). */
export function monthCellOpacity(date: string, monthAnchor: string, today: string): number {
  if (date < today) return 0.45;
  if (date.slice(0, 7) !== monthAnchor.slice(0, 7)) return 0.55;
  return 1;
}

/** Célula do mês em Execução: carga do dia (blocos visíveis), até 3 etapas e "+N". */
export function monthCellSummary<T extends { start: string; end: string }>(blocks: T[]) {
  const sorted = [...blocks].sort((a, b) => a.start.localeCompare(b.start));
  const load = sorted.reduce((a, b) => a + minutesBetween(b.start, b.end), 0);
  return { load: load ? formatDuration(load) : "", bars: sorted.slice(0, MONTH_BARS), more: Math.max(0, sorted.length - MONTH_BARS) };
}
