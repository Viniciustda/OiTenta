import { Logger } from '@nestjs/common';
import type {
  GoalAssistantProvider,
  GoalCategory,
  GoalDraftField,
  ParsedGoal,
  ParseGoalIn,
  SuggestedSteps,
  SuggestStepsIn,
} from '@oitenta/goals';
import { ServiceUnavailableError } from '@oitenta/shared';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LlmParsedGoalOutput, LlmSuggestedStepsOutput } from './llm-output.dto';
import {
  PARSE_GOAL_V1_PROMPT,
  PARSE_GOAL_V1_PROMPT_ID,
} from './prompts/parse-goal.v1.prompt';
import {
  SUGGEST_STEPS_V1_PROMPT,
  SUGGEST_STEPS_V1_PROMPT_ID,
} from './prompts/suggest-steps.v1.prompt';

// Adaptador HTTP para qualquer fornecedor que fale o formato /chat/completions da OpenAI
// (Groq, OpenRouter, Ollama...). docs/7-proposta-ia.md §c.3–§c.7. Sem SDK: só fetch.
// Garante só o formato da saída; as regras do domínio ficam no GoalDraftNormalizer.

export interface OpenAiCompatibleGoalAssistantOptions {
  /** Ex.: https://api.groq.com/openai/v1 (a barra final é ignorada). */
  baseUrl: string;
  model: string;
  /** Vazio → sem cabeçalho Authorization (Ollama local). */
  apiKey: string;
  /** Tempo máximo de cada chamada. */
  timeoutMs: number;
  /** true → o texto do usuário e a resposta entram no log (só desenvolvimento). */
  logContent: boolean;
}

export interface AssistantLogger {
  log(message: string): void;
  warn(message: string): void;
}

export interface OpenAiCompatibleGoalAssistantDeps {
  fetch?: typeof fetch;
  logger?: AssistantLogger;
}

type Operation = 'parseGoal' | 'suggestSteps';

type Outcome =
  | 'ok'
  | 'timeout'
  | 'network'
  | `http_${number}`
  | 'invalid_json'
  | 'invalid_output'
  | 'error';

interface CallLog {
  outcome: Outcome;
  tokensIn: string;
  tokensOut: string;
  output?: string;
  error?: string;
}

const ERROR_DETAIL_MAX = 200;
const TEMPERATURE = 0.2;

class CallFailure extends Error {
  constructor(
    readonly outcome: Outcome,
    readonly domainError: ServiceUnavailableError,
    readonly detail?: string,
  ) {
    super(domainError.message);
  }
}

const unavailable = (outcome: Outcome, detail?: string) =>
  new CallFailure(
    outcome,
    new ServiceUnavailableError('assistant.unavailable'),
    detail,
  );

const invalidOutput = (outcome: 'invalid_json' | 'invalid_output') =>
  new CallFailure(
    outcome,
    new ServiceUnavailableError('assistant.invalid-output'),
  );

export class OpenAiCompatibleGoalAssistantProvider implements GoalAssistantProvider {
  private readonly fetchFn: typeof fetch;
  private readonly logger: AssistantLogger;
  private readonly url: string;

  constructor(
    private readonly options: OpenAiCompatibleGoalAssistantOptions,
    deps: OpenAiCompatibleGoalAssistantDeps = {},
  ) {
    this.fetchFn =
      deps.fetch ??
      ((input: Parameters<typeof fetch>[0], init?: RequestInit) =>
        fetch(input, init));
    this.logger = deps.logger ?? new Logger('GoalAssistant');
    this.url = `${options.baseUrl.replace(/\/+$/, '')}/chat/completions`;
  }

  async parseGoal(input: ParseGoalIn): Promise<ParsedGoal> {
    // Só o texto e a data de hoje: o fuso (input.timezone) não vai ao fornecedor (§c.6).
    const output = await this.call(
      'parseGoal',
      PARSE_GOAL_V1_PROMPT_ID,
      fillToday(PARSE_GOAL_V1_PROMPT, input.today),
      delimit(input.text),
      LlmParsedGoalOutput,
    );

    const title = output.title?.trim() ? output.title : null;
    const deadline = output.deadline?.trim() ? output.deadline : null;
    const missingFields: GoalDraftField[] = [];
    if (title === null) missingFields.push('title');
    if (deadline === null) missingFields.push('deadline');

    return {
      title,
      deadline,
      // Pode vir fora das 4; o GoalDraftNormalizer troca por 'generic'.
      category: output.category as GoalCategory,
      requirements: output.requirements ?? [],
      missingFields,
      engine: 'llm',
    };
  }

  async suggestSteps(input: SuggestStepsIn): Promise<SuggestedSteps> {
    const output = await this.call(
      'suggestSteps',
      SUGGEST_STEPS_V1_PROMPT_ID,
      fillToday(SUGGEST_STEPS_V1_PROMPT, input.today),
      delimit(
        JSON.stringify({
          title: input.title,
          deadline: input.deadline,
          category: input.category,
          requirements: input.requirements,
          text: input.text,
        }),
      ),
      LlmSuggestedStepsOutput,
    );

    return {
      steps: output.steps.map((step) => ({
        title: step.title,
        estimatedMinutes: step.estimatedMinutes,
        microSteps: step.microSteps ?? [],
      })),
      engine: 'llm',
    };
  }

  private async call<T extends object>(
    op: Operation,
    promptId: string,
    system: string,
    user: string,
    outputClass: new () => T,
  ): Promise<T> {
    const startedAt = Date.now();
    const log: CallLog = { outcome: 'ok', tokensIn: '-', tokensOut: '-' };
    try {
      const envelope = await this.post(system, user);
      log.tokensIn = tokenCount(envelope, 'prompt_tokens');
      log.tokensOut = tokenCount(envelope, 'completion_tokens');

      const content = messageContent(envelope);
      if (content === undefined) throw invalidOutput('invalid_output');
      log.output = content;

      return await parseOutput(content, outputClass);
    } catch (error) {
      // Erro que não é de rede, HTTP nem formato (ex.: timeoutMs inválido) também vira 503.
      const failure =
        error instanceof CallFailure
          ? error
          : unavailable('error', errorMessage(error));
      log.outcome = failure.outcome;
      log.error = failure.detail;
      throw failure.domainError;
    } finally {
      this.write(op, promptId, Date.now() - startedAt, user, log);
    }
  }

  private async post(system: string, user: string): Promise<unknown> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.options.apiKey) {
      headers.Authorization = `Bearer ${this.options.apiKey}`;
    }

    // Montado fora do try: erro aqui é de configuração (outcome=error), não de rede.
    const init: RequestInit = {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: this.options.model,
        temperature: TEMPERATURE,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
      signal: AbortSignal.timeout(this.options.timeoutMs),
    };

    let status: number;
    let ok: boolean;
    let raw: string;
    try {
      const response = await this.fetchFn(this.url, init);
      status = response.status;
      ok = response.ok;
      raw = await response.text();
    } catch (error) {
      throw unavailable(
        isTimeout(error) ? 'timeout' : 'network',
        errorMessage(error),
      );
    }

    if (!ok) throw unavailable(`http_${status}`, raw);

    try {
      return JSON.parse(raw) as unknown;
    } catch {
      throw invalidOutput('invalid_json');
    }
  }

  private write(
    op: Operation,
    promptId: string,
    ms: number,
    user: string,
    log: CallLog,
  ): void {
    let line =
      `assistant op=${op} provider=openai-compatible model=${this.options.model}` +
      ` prompt=${promptId} ms=${ms} outcome=${log.outcome}` +
      ` tokens_in=${log.tokensIn} tokens_out=${log.tokensOut}`;
    if (this.options.logContent) {
      line += ` input=${JSON.stringify(this.redact(user))}`;
      if (log.output !== undefined) {
        line += ` output=${JSON.stringify(this.redact(log.output))}`;
      }
    }
    if (log.error !== undefined) {
      const detail = this.redact(log.error).slice(0, ERROR_DETAIL_MAX);
      line += ` error=${JSON.stringify(detail)}`;
    }

    if (log.outcome === 'ok') this.logger.log(line);
    else this.logger.warn(line);
  }

  /** A chave nunca vai para o log, nem quando o fornecedor a ecoa num erro. */
  private redact(text: string): string {
    const key = this.options.apiKey;
    return key ? text.split(key).join('***') : text;
  }
}

/** Substitui {{today}} sem interpretar padrões especiais de String.replace. */
function fillToday(prompt: string, today: string): string {
  return prompt.split('{{today}}').join(today);
}

/**
 * O conteúdo do usuário vai entre delimitadores; o prompt de sistema manda ignorar instruções
 * dentro dele. Delimitadores que já venham no conteúdo (qualquer caixa) viram [objetivo] e
 * [/objetivo], para o texto não conseguir fechar o bloco.
 */
function delimit(content: string): string {
  const neutral = content.replace(
    /<\s*(\/?)\s*objetivo\s*>/gi,
    (_tag, slash: string) => `[${slash}objetivo]`,
  );
  return `<objetivo>\n${neutral}\n</objetivo>`;
}

/** Tira cercas de markdown (```json ... ```), comuns no Ollama, antes do JSON.parse. */
function stripCodeFence(content: string): string {
  const fenced = /^\s*```[a-z]*\s*\n([\s\S]*?)\n?\s*```\s*$/i.exec(content);
  return fenced ? fenced[1] : content;
}

/** Pelo nome, e não por instanceof: o DOMException do AbortSignal pode vir de outro realm. */
function isTimeout(error: unknown): boolean {
  const name = isRecord(error) ? error.name : undefined;
  return name === 'TimeoutError' || name === 'AbortError';
}

function errorMessage(error: unknown): string {
  return isRecord(error) && typeof error.message === 'string'
    ? error.message
    : String(error);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function messageContent(envelope: unknown): string | undefined {
  if (!isRecord(envelope) || !Array.isArray(envelope.choices)) return;
  const choice: unknown = envelope.choices[0];
  if (!isRecord(choice) || !isRecord(choice.message)) return;
  const content = choice.message.content;
  return typeof content === 'string' ? content : undefined;
}

function tokenCount(
  envelope: unknown,
  field: 'prompt_tokens' | 'completion_tokens',
): string {
  if (!isRecord(envelope) || !isRecord(envelope.usage)) return '-';
  const value = envelope.usage[field];
  return typeof value === 'number' ? String(value) : '-';
}

async function parseOutput<T extends object>(
  content: string,
  outputClass: new () => T,
): Promise<T> {
  let json: unknown;
  try {
    json = JSON.parse(stripCodeFence(content));
  } catch {
    throw invalidOutput('invalid_json');
  }
  if (!isRecord(json)) throw invalidOutput('invalid_output');

  const output = plainToInstance(outputClass, json);
  const errors = await validate(output);
  if (errors.length > 0) throw invalidOutput('invalid_output');
  return output;
}
