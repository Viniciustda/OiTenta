import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

// Formato do JSON devolvido pelo LLM (docs/7-proposta-ia.md §c.3, camada 1).
// Só garante os tipos; limites, datas e categorias são do GoalDraftNormalizer (domínio).

/** Resposta do prompt parse-goal. `null` ou ausente em título e prazo vira missingFields. */
export class LlmParsedGoalOutput {
  @IsOptional()
  @IsString()
  title?: string | null;

  @IsOptional()
  @IsString()
  deadline?: string | null;

  /** Texto livre: categoria fora das 4 passa e o normalizador troca por `generic`. */
  @IsString()
  category!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];
}

export class LlmSuggestedStepOutput {
  @IsString()
  title!: string;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  estimatedMinutes!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  microSteps?: string[];
}

/** Resposta do prompt suggest-steps. Lista vazia passa aqui; o normalizador lança `assistant.empty-steps`. */
export class LlmSuggestedStepsOutput {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LlmSuggestedStepOutput)
  steps!: LlmSuggestedStepOutput[];
}
