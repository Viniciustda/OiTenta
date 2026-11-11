import { ApiProperty } from '@nestjs/swagger';
import type { PlanGoalView, PlanView } from './plan-input';

// Plano recalculado devolvido pelo PUT da disponibilidade, pelo POST /goals e pelo
// POST /activation/sessions (docs/4 §2, §3, §5). `scheduledMinutes` é um campo a mais do motor.
export class PlanGoalResponse implements PlanGoalView {
  @ApiProperty({ format: 'uuid' })
  goalId!: string;

  @ApiProperty({ example: true })
  feasible!: boolean;

  @ApiProperty({
    example: true,
    description: 'true quando o plano manteve a folga antes do prazo.',
  })
  usedSlack!: boolean;

  @ApiProperty({
    type: Number,
    nullable: true,
    example: 1,
    description: 'Dias de folga mantidos; null para objetivo sem prazo.',
  })
  slackDays!: number | null;

  @ApiProperty({ example: 495 })
  scheduledMinutes!: number;

  @ApiProperty({ example: 0 })
  unscheduledMinutes!: number;
}

export class PlanResponse implements PlanView {
  @ApiProperty({ example: 495 })
  totalMinutes!: number;

  @ApiProperty({ example: 6 })
  days!: number;

  @ApiProperty({ type: [PlanGoalResponse] })
  goals!: PlanGoalResponse[];
}
