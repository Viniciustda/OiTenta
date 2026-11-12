// Motor de regras do assistente (docs/7-proposta-ia.md §a.3, IA1).
// Sem rede e determinístico: é o padrão (AI_PROVIDER=rules) e a reserva do LLM.

import {
  GoalAssistantProvider,
  GoalCategory,
  GoalDraftField,
  ParsedGoal,
  ParseGoalIn,
  SuggestedSteps,
  SuggestStepsIn,
} from '@oitenta/goals';
import { normalizePtBr, parsePtBrDate } from './pt-br-date.parser';
import { buildSteps } from './step-templates';

const TITLE_MAX_LENGTH = 120;

/** O título é o texto até o primeiro destes separadores. */
const TITLE_SEPARATOR = /[—–,:.\n]/;
const LEADING_SEPARATORS = /^[\s—–,:.]+/;
const HAS_LETTER_OR_DIGIT = /[\p{L}\p{N}]/u;

/** Palavras-chave por categoria, já minúsculas e sem acento. */
const CATEGORY_KEYWORDS: ReadonlyArray<[GoalCategory, readonly string[]]> = [
  ['exam', ['prova', 'teste', 'exame', 'p1', 'p2', 'simulado']],
  ['assignment', ['trabalho', 'relatorio', 'lista', 'entrega', 'tp']],
  ['project', ['projeto', 'app', 'site', 'portfolio', 'tcc']],
];

export class RulesGoalAssistantProvider implements GoalAssistantProvider {
  parseGoal(input: ParseGoalIn): Promise<ParsedGoal> {
    const title = extractTitle(input.text);
    const deadline = parsePtBrDate(input.text, input.today);
    const missingFields: GoalDraftField[] = [];
    if (title === null) missingFields.push('title');
    if (deadline === null) missingFields.push('deadline');
    return Promise.resolve({
      title,
      deadline,
      category: detectCategory(input.text),
      requirements: [],
      missingFields,
      engine: 'rules',
    });
  }

  suggestSteps(input: SuggestStepsIn): Promise<SuggestedSteps> {
    return Promise.resolve({
      steps: buildSteps(input.category, input.title),
      engine: 'rules',
    });
  }
}

/**
 * Sem os separadores e espaços do início, o texto até o primeiro separador,
 * sem espaços nas pontas e cortado em 120 na última palavra inteira.
 * Sem letra nem número (só pontuação) → `null`.
 */
function extractTitle(text: string): string | null {
  const rest = text.replace(LEADING_SEPARATORS, '');
  const title = truncateAtWord(rest.split(TITLE_SEPARATOR)[0]);
  return HAS_LETTER_OR_DIGIT.test(title) ? title : null;
}

function truncateAtWord(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length <= TITLE_MAX_LENGTH) return trimmed;
  const cut = trimmed.slice(0, TITLE_MAX_LENGTH);
  if (/\s/.test(trimmed.charAt(TITLE_MAX_LENGTH))) return cut.trimEnd();
  const lastSpace = cut.search(/\s\S*$/);
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd();
}

/** A categoria da palavra-chave (palavra inteira) que aparece primeiro no texto. */
function detectCategory(text: string): GoalCategory {
  const normalized = normalizePtBr(text);
  let best: { category: GoalCategory; index: number } | null = null;
  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    for (const keyword of keywords) {
      const match = new RegExp(`(?<![a-z0-9])${keyword}(?![a-z0-9])`).exec(
        normalized,
      );
      if (match && (best === null || match.index < best.index)) {
        best = { category, index: match.index };
      }
    }
  }
  return best?.category ?? 'generic';
}
