// Regras de data do motor de regras (docs/7-proposta-ia.md §a.3).
// Função pura: só usa a data `today` (YYYY-MM-DD); a aritmética é em UTC para
// não depender do fuso da máquina.

const DAY_MS = 24 * 60 * 60 * 1000;

const MONTHS = [
  'janeiro',
  'fevereiro',
  'marco',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

/** Índice = getUTCDay() (0 = domingo). */
const WEEKDAYS = [
  'domingo',
  'segunda',
  'terca',
  'quarta',
  'quinta',
  'sexta',
  'sabado',
];

const MONTH_PATTERN = MONTHS.join('|');

// Fronteiras de palavra sobre o texto já normalizado (minúsculas, sem acento).
const W_START = '(?<![a-z0-9])';
const W_END = '(?![a-z0-9])';

const NUMERIC_WITH_YEAR = /(?<!\d)(\d{1,2})\/(\d{1,2})\/(\d{4}|\d{2})(?!\d)/;
const NUMERIC_NO_YEAR = /(?<![\d/-])(\d{1,2})[/-](\d{1,2})(?!\d)/;
const DAY_ONLY = new RegExp(
  `${W_START}dia\\s+(\\d{1,2})(?!\\d)(?!\\s+de\\s+(?:${MONTH_PATTERN})${W_END})`,
);
const DAY_OF_MONTH = new RegExp(
  `${W_START}(\\d{1,2})\\s+de\\s+(${MONTH_PATTERN})${W_END}`,
);
const TODAY = new RegExp(`${W_START}hoje${W_END}`);
const DAY_AFTER_TOMORROW = new RegExp(`${W_START}depois de amanha${W_END}`);
const TOMORROW = new RegExp(`${W_START}amanha${W_END}`);
const WEEKDAY = new RegExp(
  `${W_START}(${WEEKDAYS.join('|')})(?:[-\\s]feira)?${W_END}`,
);
const NEXT_WEEK = new RegExp(
  `${W_START}(?:semana que vem|proxima semana)${W_END}`,
);
const IN_N_DAYS = new RegExp(
  `${W_START}(?:em|daqui a)\\s+(\\d{1,3})\\s+dias?${W_END}`,
);
const END_OF_MONTH = new RegExp(`${W_START}fim do mes${W_END}`);

/**
 * Devolve `undefined` quando a regra não casa (passa para a próxima) ou a
 * data/`null` quando casa: a primeira regra que casar vale.
 */
type Rule = (text: string, today: Date) => Date | null | undefined;

/** Regras na ordem da tabela do §a.3. */
const RULES: Rule[] = [
  // dd/mm/aaaa, dd/mm/aa
  (text) => {
    const m = NUMERIC_WITH_YEAR.exec(text);
    if (!m) return undefined;
    const year = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    return makeDate(year, Number(m[2]), Number(m[1]));
  },
  // dd/mm, dd-mm: a próxima ocorrência ≥ hoje
  (text, today) => {
    const m = NUMERIC_NO_YEAR.exec(text);
    if (!m) return undefined;
    return nextYearlyOccurrence(today, Number(m[2]), Number(m[1]));
  },
  // dia dd: mês atual; se já passou, o próximo mês
  (text, today) => {
    const m = DAY_ONLY.exec(text);
    if (!m) return undefined;
    const day = Number(m[1]);
    const year = today.getUTCFullYear();
    const month = today.getUTCMonth() + 1;
    if (day >= today.getUTCDate()) return makeDate(year, month, day);
    return month === 12
      ? makeDate(year + 1, 1, day)
      : makeDate(year, month + 1, day);
  },
  // dd de <mês>: a próxima ocorrência ≥ hoje
  (text, today) => {
    const m = DAY_OF_MONTH.exec(text);
    if (!m) return undefined;
    return nextYearlyOccurrence(today, MONTHS.indexOf(m[2]) + 1, Number(m[1]));
  },
  // hoje, depois de amanhã, amanhã ("depois de amanhã" antes de "amanhã")
  (text, today) => {
    if (TODAY.test(text)) return today;
    if (DAY_AFTER_TOMORROW.test(text)) return addDays(today, 2);
    if (TOMORROW.test(text)) return addDays(today, 1);
    return undefined;
  },
  // dia da semana: a próxima ocorrência depois de hoje
  (text, today) => {
    const m = WEEKDAY.exec(text);
    if (!m) return undefined;
    const diff = (WEEKDAYS.indexOf(m[1]) - today.getUTCDay() + 7) % 7;
    return addDays(today, diff === 0 ? 7 : diff);
  },
  // semana que vem / próxima semana: domingo da semana seguinte (seg–dom)
  (text, today) => {
    if (!NEXT_WEEK.test(text)) return undefined;
    const toThisSunday = (7 - today.getUTCDay()) % 7;
    return addDays(today, toThisSunday + 7);
  },
  // em N dias / daqui a N dias
  (text, today) => {
    const m = IN_N_DAYS.exec(text);
    if (!m) return undefined;
    return addDays(today, Number(m[1]));
  },
  // fim do mês
  (text, today) => {
    if (!END_OF_MONTH.test(text)) return undefined;
    return new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0),
    );
  },
];

/**
 * Extrai o prazo de um texto em português, ignorando maiúsculas e acentos.
 * @param text texto livre do usuário
 * @param today data local do usuário, YYYY-MM-DD
 * @returns YYYY-MM-DD, ou `null` se não há data, se ela não existe ou se está no passado
 */
export function parsePtBrDate(text: string, today: string): string | null {
  const todayDate = parseIsoDate(today);
  if (!todayDate) return null;
  const normalized = normalizePtBr(text);
  for (const rule of RULES) {
    const result = rule(normalized, todayDate);
    if (result === undefined) continue;
    if (result === null || result.getTime() < todayDate.getTime()) return null;
    return result.toISOString().slice(0, 10);
  }
  return null;
}

/** Minúsculas e sem acento ("Amanhã" → "amanha"). */
export function normalizePtBr(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

function parseIsoDate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  return makeDate(Number(m[1]), Number(m[2]), Number(m[3]));
}

/** Meia-noite UTC do dia, ou `null` se o dia não existe (ex.: 31/02). */
function makeDate(year: number, month: number, day: number): Date | null {
  const date = new Date(Date.UTC(year, month - 1, day));
  const exists =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
  return exists ? date : null;
}

/** Sem ano: este ano se o dia/mês ainda não passou; senão, o ano seguinte. */
function nextYearlyOccurrence(
  today: Date,
  month: number,
  day: number,
): Date | null {
  const currentMonth = today.getUTCMonth() + 1;
  const notPassed =
    month > currentMonth ||
    (month === currentMonth && day >= today.getUTCDate());
  const year = today.getUTCFullYear() + (notPassed ? 0 : 1);
  return makeDate(year, month, day);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}
