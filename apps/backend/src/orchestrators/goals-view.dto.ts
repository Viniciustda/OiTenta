import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  CreateGoalIn,
  CreateGoalStepIn,
  GoalColorIndex,
  GoalKind,
  GoalSource,
  GoalStatus,
  GoalView,
} from '@oitenta/goals';
import type { NextBlockView } from '@oitenta/scheduling';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { GoalHeaderResponse, StepResponse } from '../modules/goals/goals.dto';
import { PlanResponse } from './plan.dto';
import type {
  GoalDetailView,
  GoalListItemView,
  StepWithNextBlockView,
} from './goals-view.orchestrator';

// Contrato: docs/4-contrato-api.md §3. Os decorators checam só o formato (400, P19);
// título vazio, zero etapas, estimativa fora de 15/múltiplo de 15 e prazo inexistente são do domínio (422).

export class CreateGoalStepBody implements CreateGoalStepIn {
  @ApiProperty({ example: 'Ler o enunciado e listar requisitos' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 30, description: 'Mínimo 15, múltiplo de 15 (P5).' })
  @IsInt()
  estimatedMinutes!: number;

  @ApiPropertyOptional({
    type: Number,
    nullable: true,
    example: 30,
    description:
      'Estimativa original da IA (D 4f, IA1): mínimo 15, múltiplo de 15; null no objetivo manual.',
  })
  @IsOptional()
  @IsInt()
  aiEstimatedMinutes?: number | null;

  @ApiPropertyOptional({
    type: [String],
    description: 'Textos do micro-passo (P6).',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  microSteps?: string[];
}

export class CreateGoalBody implements Omit<CreateGoalIn, 'userId'> {
  @ApiProperty({ example: 'Trabalho de Algoritmos' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: '2026-11-24',
    description: 'Data local YYYY-MM-DD da entrega; opcional (P3).',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'deadline deve estar no formato YYYY-MM-DD',
  })
  deadline?: string | null;

  @ApiProperty({ enum: ['goal', 'single'] })
  @IsIn(['goal', 'single'])
  kind!: GoalKind;

  @ApiPropertyOptional({
    enum: ['manual', 'ai'],
    default: 'manual',
    description: '"ai" quando o objetivo veio do rascunho do assistente (IA1).',
  })
  @IsOptional()
  @IsIn(['manual', 'ai'])
  source?: GoalSource;

  @ApiProperty({ type: [CreateGoalStepBody] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGoalStepBody)
  steps!: CreateGoalStepBody[];
}

export class GoalViewResponse extends GoalHeaderResponse implements GoalView {
  @ApiProperty({ example: 0 })
  progressPct!: number;

  @ApiProperty({ type: [StepResponse] })
  steps!: StepResponse[];
}

export class CreateGoalResponse {
  @ApiProperty({ type: GoalViewResponse })
  goal!: GoalViewResponse;

  @ApiProperty({ type: PlanResponse })
  plan!: PlanResponse;
}

export class GoalListItemResponse implements GoalListItemView {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'TCC' })
  title!: string;

  @ApiProperty({ type: String, nullable: true, example: '2026-12-15' })
  deadline!: string | null;

  @ApiProperty({ enum: [1, 2, 3, 4] })
  colorIndex!: GoalColorIndex;

  @ApiProperty({ example: 20 })
  progressPct!: number;

  @ApiProperty({ example: 1 })
  done!: number;

  @ApiProperty({ example: 5 })
  total!: number;

  @ApiProperty({ enum: ['active', 'done'] })
  status!: GoalStatus;

  @ApiProperty({
    type: Number,
    nullable: true,
    example: 1,
    description:
      'Folga no plano atual; null para objetivo sem prazo ou concluído.',
  })
  slackDays!: number | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-11-10T22:00:00.000Z',
    description: 'Instante de criação (ISO 8601 UTC).',
  })
  createdAt!: Date;
}

export class GoalListResponse {
  @ApiProperty({ type: [GoalListItemResponse] })
  goals!: GoalListItemResponse[];
}

export class NextBlockResponse implements NextBlockView {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  start!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  end!: Date;
}

export class StepWithNextBlockResponse
  extends StepResponse
  implements StepWithNextBlockView
{
  @ApiPropertyOptional({
    type: NextBlockResponse,
    description:
      'Próximo bloco planejado; só nas etapas pendentes que têm bloco.',
  })
  nextBlock?: NextBlockResponse;
}

export class GoalDetailResponse implements GoalDetailView {
  @ApiProperty({ type: GoalHeaderResponse })
  goal!: GoalHeaderResponse;

  @ApiProperty({ type: [StepWithNextBlockResponse] })
  steps!: StepWithNextBlockResponse[];

  @ApiProperty({ example: 0 })
  progressPct!: number;

  @ApiProperty({ example: 0 })
  done!: number;

  @ApiProperty({ example: 2 })
  total!: number;
}
