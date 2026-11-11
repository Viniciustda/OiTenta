import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AVAILABLE_TIMES,
  type AvailableTime,
  type BuildRampOut,
  type ChallengeProblem,
  ENERGY_LEVELS,
  type EnergyLevel,
  RAMP_STEP_KINDS,
  type RampOption,
  type RampStep,
  type RampStepKind,
} from '@oitenta/activation';
import { IsIn, IsOptional, IsUUID } from 'class-validator';

// Contrato: docs/4-contrato-api.md §5. A query checa só o formato (400, P19).

export class RampQuery {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  goalId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  stepId!: string;

  @ApiProperty({ enum: ENERGY_LEVELS })
  @IsIn([...ENERGY_LEVELS])
  energy!: EnergyLevel;

  @ApiPropertyOptional({
    enum: AVAILABLE_TIMES,
    description: 'Só gravado na sessão nesta fase (P15); o web não envia.',
  })
  @IsOptional()
  @IsIn([...AVAILABLE_TIMES])
  availableTime?: AvailableTime;
}

export class ChallengeProblemResponse implements ChallengeProblem {
  @ApiProperty({ example: 7 })
  a!: number;

  @ApiProperty({ example: 5 })
  b!: number;

  @ApiProperty({ enum: ['+', '−', '×'] })
  op!: ChallengeProblem['op'];
}

export class RampOptionResponse implements RampOption {
  @ApiProperty({ example: 'warmup-1' })
  id!: string;

  @ApiProperty({ enum: RAMP_STEP_KINDS })
  stepKind!: RampStepKind;

  @ApiProperty({ example: 'Alongamento de 3 min' })
  title!: string;

  @ApiProperty({ example: '3 min' })
  durationLabel!: string;

  @ApiPropertyOptional({ example: 180 })
  durationSeconds?: number;

  @ApiProperty()
  description!: string;

  @ApiProperty({ example: 'footprints' })
  icon!: string;

  @ApiPropertyOptional({ type: [String] })
  steps?: string[];

  @ApiPropertyOptional({ enum: ['+', '−', '×', 'mix'] })
  operation?: RampOption['operation'];

  @ApiPropertyOptional({ type: [ChallengeProblemResponse] })
  problems?: ChallengeProblemResponse[];
}

export class RampStepResponse implements RampStep {
  @ApiProperty({ enum: RAMP_STEP_KINDS })
  kind!: RampStepKind;

  @ApiProperty({ type: [RampOptionResponse] })
  options!: RampOptionResponse[];
}

export class RampResponse implements BuildRampOut {
  @ApiProperty({ type: [RampStepResponse] })
  steps!: RampStepResponse[];

  @ApiProperty({ enum: RAMP_STEP_KINDS })
  suggested!: RampStepKind;
}
