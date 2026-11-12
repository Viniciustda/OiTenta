/* eslint-disable no-console */
// Avaliação rápida do assistente do novo objetivo (docs/7-proposta-ia.md §e.3, tarefa 10).
// Roda os textos de referência no motor configurado pelo .env (ou pelas variáveis da linha
// de comando, que têm prioridade) e imprime uma tabela em Markdown para a decisão de sexta.
//
//   npm --workspace apps/backend run ai:eval
//   AI_PROVIDER=openai-compatible AI_BASE_URL=http://localhost:11434/v1 AI_MODEL=<modelo> \
//     npm --workspace apps/backend run ai:eval
//
// Nunca imprime a chave. Não grava nada no banco.
import 'dotenv/config';
import {
  createGoalAssistant,
  readAiSettings,
} from '../src/modules/goals/assistant/goal-assistant.factory';
import { GoalDraftRunner } from '../src/modules/goals/assistant/goal-draft.runner';
import { RulesGoalAssistantProvider } from '../src/modules/goals/assistant/rules-goal-assistant.provider';

export const REFERENCE_TEXTS: readonly string[] = [
  'Trabalho de Algoritmos — implementar e comparar 3 algoritmos de ordenação, entrega 24/11',
  'Prova de Cálculo 1 na sexta, cai derivadas e limites',
  'TCC: entregar a primeira versão do capítulo 2 até 3 de dezembro',
  'Lista de exercícios de Física para amanhã',
  'Montar meu portfólio no GitHub com 3 projetos',
  'Apresentação do seminário de História em 10 dias',
  'Estudar inglês para o simulado da semana que vem',
  'Relatório do estágio, entrega dia 30',
  'Fazer um app de lista de compras em Flutter até o fim do mês',
  'Organizar minhas anotações da faculdade',
];

const TIMEZONE = 'America/Sao_Paulo';
const cell = (value: string) => value.replace(/\|/g, '\\|');

async function main(): Promise<void> {
  const settings = readAiSettings((key) => process.env[key]);
  const rules = new RulesGoalAssistantProvider();
  const runner = new GoalDraftRunner(
    createGoalAssistant(settings, rules),
    rules,
    settings,
    { warn: () => undefined },
  );
  const now = new Date();

  console.log(
    `Motor: ${settings.provider}${settings.model ? ` (${settings.model})` : ''}` +
      `${settings.baseUrl ? ` em ${settings.baseUrl}` : ''} · orçamento ${settings.timeoutMs} ms` +
      ` · reserva ${settings.fallback} · ${now.toISOString()} (${TIMEZONE})\n`,
  );
  console.log(
    '| # | Título | Prazo | Categoria | Etapas | Total (min) | Tempo (ms) | Engine | Reserva |',
  );
  console.log('|---|---|---|---|---|---|---|---|---|');

  const details: string[] = [];
  for (const [index, text] of REFERENCE_TEXTS.entries()) {
    const started = Date.now();
    try {
      const { draft, engine, fallbackReason } = await runner.run({
        userId: 'ai-eval',
        text,
        now,
        timezone: TIMEZONE,
      });
      const ms = Date.now() - started;
      console.log(
        `| ${index + 1} | ${cell(draft.title ?? '—')} | ${draft.deadline ?? '—'} | ${draft.category} | ${draft.steps.length} | ${draft.totalMinutes} | ${ms} | ${engine} | ${fallbackReason ?? 'não'} |`,
      );
      details.push(
        `${index + 1}. "${text}"\n` +
          (draft.requirements.length
            ? `   - requisitos: ${draft.requirements.join('; ')}\n`
            : '') +
          draft.steps
            .map(
              (step) =>
                `   - ${step.title} (${step.estimatedMinutes} min)` +
                (step.microSteps.length
                  ? ` → ${step.microSteps.join(' / ')}`
                  : ''),
            )
            .join('\n'),
      );
    } catch (error) {
      const ms = Date.now() - started;
      console.log(
        `| ${index + 1} | erro: ${cell((error as Error).message)} | — | — | — | — | ${ms} | — | — |`,
      );
    }
  }

  console.log('\nEtapas de cada texto:\n');
  console.log(details.join('\n'));
}

void main();
