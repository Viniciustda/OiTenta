import { ApiProperty } from '@nestjs/swagger';
import type {
  GetGoalOut,
  GoalColorIndex,
  GoalHeaderView,
  GoalKind,
  GoalSource,
  GoalStatus,
  StepStatus,
  StepView,
} from '@oitenta/goals';

// Classes só para o Swagger enxergar o contrato; o tipo real é a saída do caso de uso.

export class GoalHeaderResponse implements GoalHeaderView {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'TCC' })
  title!: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: '2026-12-15',
    description: 'Data local YYYY-MM-DD.',
  })
  deadline!: string | null;

  @ApiProperty({ enum: ['goal', 'single'] })
  kind!: GoalKind;

  @ApiProperty({ enum: [1, 2, 3, 4] })
  colorIndex!: GoalColorIndex;

  @ApiProperty({ enum: ['manual', 'ai'] })
  source!: GoalSource;

  @ApiProperty({ enum: ['active', 'done'] })
  status!: GoalStatus;
}

export class StepResponse implements StepView {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 1 })
  order!: number;

  @ApiProperty({ example: 'Ler os artigos' })
  title!: string;

  @ApiProperty({ example: 60 })
  estimatedMinutes!: number;

  @ApiProperty({ type: Number, nullable: true })
  aiEstimatedMinutes!: number | null;

  @ApiProperty({ example: 0 })
  progressPct!: number;

  @ApiProperty({ enum: ['pending', 'done', 'superseded'] })
  status!: StepStatus;

  @ApiProperty({ type: [String] })
  microSteps!: string[];

  @ApiProperty({
    example: 60,
    description: 'Minutos restantes, arredondados para cima em blocos de 15.',
  })
  remainingMinutes!: number;
}

export class GetGoalResponse implements GetGoalOut {
  @ApiProperty({ type: GoalHeaderResponse })
  goal!: GoalHeaderResponse;

  @ApiProperty({ type: [StepResponse] })
  steps!: StepResponse[];

  @ApiProperty({ example: 0 })
  progressPct!: number;

  @ApiProperty({ example: 0 })
  done!: number;

  @ApiProperty({ example: 2 })
  total!: number;
}
