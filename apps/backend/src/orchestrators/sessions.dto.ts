import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AVAILABLE_TIMES,
  type AvailableTime,
  ENERGY_LEVELS,
  type EnergyLevel,
  FOCUS_SESSION_OUTCOMES,
  type FocusSession,
  type FocusSessionOutcome,
} from '@oitenta/activation';
import { IsDateString, IsIn, IsInt, IsOptional, IsUUID } from 'class-validator';
import { StepResponse } from '../modules/goals/goals.dto';
import { PlanResponse } from './plan.dto';
import type { RecordProgressIn } from './record-progress.orchestrator';

// Contrato: docs/4-contrato-api.md §5. Os decorators checam só o formato (400, P19);
// `partial` sem %, % fora de 1–99 e endedAt antes de startedAt são do domínio (422).
// As datas chegam como texto ISO e viram Date no controller (por isso o Omit).
export class RecordSessionBody implements Omit<
  RecordProgressIn,
  'userId' | 'startedAt' | 'endedAt'
> {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  goalId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  stepId!: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Bloco do plano, quando a sessão começou por ele.',
  })
  @IsOptional()
  @IsUUID()
  blockId?: string;

  @ApiProperty({ enum: ENERGY_LEVELS })
  @IsIn([...ENERGY_LEVELS])
  energy!: EnergyLevel;

  @ApiPropertyOptional({ enum: AVAILABLE_TIMES })
  @IsOptional()
  @IsIn([...AVAILABLE_TIMES])
  availableTime?: AvailableTime;

  @ApiProperty({ example: '2026-11-10T22:00:00.000Z' })
  @IsDateString({ strict: true })
  startedAt!: string;

  @ApiProperty({ example: '2026-11-10T22:25:00.000Z' })
  @IsDateString({ strict: true })
  endedAt!: string;

  @ApiProperty({ example: 25 })
  @IsInt()
  focusedMinutes!: number;

  @ApiProperty({ enum: FOCUS_SESSION_OUTCOMES })
  @IsIn([...FOCUS_SESSION_OUTCOMES])
  outcome!: FocusSessionOutcome;

  @ApiPropertyOptional({
    example: 70,
    description: 'Obrigatório (1–99) só com outcome partial.',
  })
  @IsOptional()
  @IsInt()
  partialPct?: number;
}

export class FocusSessionResponse {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  goalId!: string;

  @ApiProperty({ format: 'uuid' })
  stepId!: string;

  @ApiProperty({ type: String, format: 'uuid', nullable: true })
  blockId!: string | null;

  @ApiProperty({ enum: ENERGY_LEVELS })
  energy!: EnergyLevel;

  @ApiProperty({ enum: AVAILABLE_TIMES, nullable: true })
  availableTime!: AvailableTime | null;

  @ApiProperty({ type: String, format: 'date-time' })
  startedAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  endedAt!: Date;

  @ApiProperty({ example: 25 })
  focusedMinutes!: number;

  @ApiProperty({ enum: FOCUS_SESSION_OUTCOMES })
  outcome!: FocusSessionOutcome;

  @ApiProperty({ type: Number, nullable: true, example: 70 })
  partialPct!: number | null;
}

export function toFocusSessionResponse(
  session: FocusSession,
): FocusSessionResponse {
  return {
    id: session.id,
    goalId: session.goalId,
    stepId: session.stepId,
    blockId: session.blockId,
    energy: session.energy,
    availableTime: session.availableTime,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    focusedMinutes: session.focusedMinutes,
    outcome: session.outcome,
    partialPct: session.partialPct,
  };
}

export class RecordSessionResponse {
  @ApiProperty({ type: FocusSessionResponse })
  session!: FocusSessionResponse;

  @ApiProperty({ type: StepResponse })
  step!: StepResponse;

  @ApiProperty({ example: 57 })
  goalProgressPct!: number;

  @ApiProperty({ type: PlanResponse })
  plan!: PlanResponse;
}
