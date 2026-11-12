import { ApiProperty } from '@nestjs/swagger';
import type {
  AssistantEngine,
  DraftGoalOut,
  GoalCategory,
  GoalDraft,
  GoalDraftField,
  GoalDraftStep,
} from '@oitenta/goals';
import { IsString } from 'class-validator';

// Contrato: docs/4-contrato-api.md §3, POST /goals/assistant/draft (IA1).
// O decorator checa só o formato (400, P19); vazio e tamanho são do domínio (422).

export class GoalDraftBody {
  @ApiProperty({
    example:
      'Trabalho de Algoritmos — implementar e comparar 3 algoritmos de ordenação, entrega 24/11',
    description: 'Texto livre do usuário, 1–2000 caracteres.',
  })
  @IsString()
  text!: string;
}

export class GoalDraftStepResponse implements GoalDraftStep {
  @ApiProperty({ example: 'Ler o enunciado e listar requisitos' })
  title!: string;

  @ApiProperty({ example: 30, description: 'Múltiplo de 15, de 15 a 240.' })
  estimatedMinutes!: number;

  @ApiProperty({
    example: 30,
    description:
      'Estimativa da IA; vai no POST /goals como aiEstimatedMinutes.',
  })
  aiEstimatedMinutes!: number;

  @ApiProperty({ type: [String], example: ['Abra o enunciado'] })
  microSteps!: string[];
}

export class GoalDraftResponse implements GoalDraft {
  @ApiProperty({
    type: String,
    nullable: true,
    example: 'Trabalho de Algoritmos',
  })
  title!: string | null;

  @ApiProperty({ type: String, nullable: true, example: '2026-11-24' })
  deadline!: string | null;

  @ApiProperty({ enum: ['assignment', 'exam', 'project', 'generic'] })
  category!: GoalCategory;

  @ApiProperty({ type: [String] })
  requirements!: string[];

  @ApiProperty({
    enum: ['title', 'deadline'],
    isArray: true,
    description: 'Informativo (IA2): a tela mostra o campo vazio.',
  })
  missingFields!: GoalDraftField[];

  @ApiProperty({ type: [GoalDraftStepResponse] })
  steps!: GoalDraftStepResponse[];

  @ApiProperty({ example: 300 })
  totalMinutes!: number;
}

export class DraftGoalResponse implements DraftGoalOut {
  @ApiProperty({ type: GoalDraftResponse })
  draft!: GoalDraftResponse;

  @ApiProperty({
    enum: ['llm', 'rules'],
    description: 'Quem respondeu; nenhuma tela depende disso.',
  })
  engine!: AssistantEngine;
}
