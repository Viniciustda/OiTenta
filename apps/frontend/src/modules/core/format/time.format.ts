// Formatação de datas e durações usada nas telas. Textos e formatos seguem o protótipo
// (design/web/source/Bora App.dc.html: dur, hm, dnum, dayLabel). Instantes vêm em UTC (contrato)
// e são mostrados no fuso do usuário.

export const DEFAULT_TIMEZONE = "America/Sao_Paulo";

const WEEKDAYS_SHORT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const WEEKDAYS_LONG = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

const pad = (n: number) => String(n).padStart(2, "0");

/** 45 → "45 min"; 180 → "3h"; 90 → "1h30". */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const r = minutes % 60;
  if (!h) return `${r} min`;
  return r ? `${h}h${pad(r)}` : `${h}h`;
}

function parts(iso: string, timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const p = Object.fromEntries(fmt.formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, minute: Number(p.hour) * 60 + Number(p.minute) };
}

/** Data local (YYYY-MM-DD) de um instante. */
export const localDate = (iso: string, timeZone: string) => parts(iso, timeZone).date;

/** Minutos desde 00:00 locais de um instante. */
export const localMinute = (iso: string, timeZone: string) => parts(iso, timeZone).minute;

/** Minutos desde 00:00 → "20:00". */
export const formatMinute = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

/** Instante → hora local "20:00". */
export const formatHm = (iso: string, timeZone: string) => formatMinute(localMinute(iso, timeZone));

function dateFromLocal(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Soma dias a uma data local. */
export function addDays(date: string, days: number): string {
  const d = dateFromLocal(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Diferença em dias entre duas datas locais (b − a). */
export const daysBetween = (a: string, b: string) =>
  Math.round((dateFromLocal(b).getTime() - dateFromLocal(a).getTime()) / 86_400_000);

/** Dia da semana com 0 = segunda (como as grades do design). */
export const weekdayIndex = (date: string) => (dateFromLocal(date).getUTCDay() + 6) % 7;

export const weekdayShort = (date: string) => WEEKDAYS_SHORT[weekdayIndex(date)];
export const weekdayLong = (date: string) => WEEKDAYS_LONG[weekdayIndex(date)];
export const dayOfMonth = (date: string) => Number(date.slice(8, 10));
export const monthName = (date: string) => MONTHS[Number(date.slice(5, 7)) - 1];

/** "2026-11-20" → "20/11". */
export const formatDdMm = (date: string) => `${date.slice(8, 10)}/${date.slice(5, 7)}`;

/** "Hoje", "Amanhã" ou "Qua, 18/11". */
export function dayLabel(date: string, today: string): string {
  const diff = daysBetween(today, date);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  return `${weekdayShort(date)}, ${formatDdMm(date)}`;
}

/** Cabeçalho do Hoje: "Segunda, 16 de novembro · 19:40". */
export function formatLongDateTime(iso: string, timeZone: string): string {
  const { date, minute } = parts(iso, timeZone);
  return `${weekdayLong(date)}, ${dayOfMonth(date)} de ${monthName(date)} · ${formatMinute(minute)}`;
}

/** Duração em minutos entre dois instantes. */
export const minutesBetween = (start: string, end: string) =>
  Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60_000);
