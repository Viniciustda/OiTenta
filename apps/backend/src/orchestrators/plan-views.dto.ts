import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import type { DayPlanView, PlanBlockView } from './plan-block-view';
import type { WeekView } from './week-view.orchestrator';

// Contrato: docs/4-contrato-api.md §4. A query checa só o formato YYYY-MM-DD (400, P19);
// data inexistente no calendário e semana que não começa na segunda são regras do domínio (422).
const LOCAL_DATE = /^\d{4}-\d{2}-\d{2}$/;
const LOCAL_DATE_MESSAGE = 'deve estar no formato YYYY-MM-DD';

export class DayPlanQuery {
  @ApiProperty({ example: '2026-11-10', description: 'Data local YYYY-MM-DD.' })
  @Matches(LOCAL_DATE, { message: `date ${LOCAL_DATE_MESSAGE}` })
  date!: string;
}

export class WeekPlanQuery {
  @ApiProperty({
    example: '2026-11-09',
    description: 'Segunda-feira local YYYY-MM-DD.',
  })
  @Matches(LOCAL_DATE, { message: `start ${LOCAL_DATE_MESSAGE}` })
  start!: string;
}

export class PlanBlockResponse implements PlanBlockView {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: '2026-11-10T22:00:00.000Z' })
  start!: Date;

  @ApiProperty({ example: '2026-11-10T23:00:00.000Z' })
  end!: Date;

  @ApiProperty({ enum: ['planned', 'done', 'partial', 'missed'] })
  status!: string;

  @ApiProperty({ format: 'uuid' })
  goalId!: string;

  @ApiProperty({ example: 'Trabalho de Algoritmos' })
  goalTitle!: string;

  @ApiProperty({ enum: [1, 2, 3, 4] })
  colorIndex!: number;

  @ApiProperty({ format: 'uuid' })
  stepId!: string;

  @ApiProperty({ example: 'Ler o enunciado e listar requisitos' })
  stepTitle!: string;
}

export class DayPlanResponse implements DayPlanView {
  @ApiProperty({ example: '2026-11-10' })
  date!: string;

  @ApiProperty({ type: [PlanBlockResponse] })
  blocks!: PlanBlockResponse[];

  @ApiProperty({ example: 120 })
  usedMinutes!: number;

  @ApiProperty({ example: 180 })
  limitMinutes!: number;
}

export class WeekPlanResponse implements WeekView {
  @ApiProperty({ type: [DayPlanResponse] })
  days!: DayPlanResponse[];
}
