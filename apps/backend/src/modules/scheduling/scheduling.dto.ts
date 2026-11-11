import { ApiProperty } from '@nestjs/swagger';
import type {
  AvailabilityWindow,
  SetWeeklyAvailabilityIn,
  WeeklyAvailability,
} from '@oitenta/scheduling';
import { Type } from 'class-transformer';
import { IsArray, IsInt, ValidateNested } from 'class-validator';

// Classes para o Swagger enxergar o contrato (docs/4-contrato-api.md §2).
// Os decorators do class-validator checam só o formato (400, P19); as regras da grade
// (zero janelas, múltiplos de 15, sobreposição, limite 60–480 de 30 em 30) ficam no
// domínio e respondem 422.

export class AvailabilityWindowBody implements AvailabilityWindow {
  @ApiProperty({ example: 0, description: '0 = segunda … 6 = domingo.' })
  @IsInt()
  weekday!: number;

  @ApiProperty({ example: 1140, description: 'Minutos desde 00:00 (local).' })
  @IsInt()
  startMinute!: number;

  @ApiProperty({ example: 1380, description: 'Minutos desde 00:00 (local).' })
  @IsInt()
  endMinute!: number;
}

export class SetWeeklyAvailabilityBody implements Omit<
  SetWeeklyAvailabilityIn,
  'userId'
> {
  @ApiProperty({ type: [AvailabilityWindowBody] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityWindowBody)
  windows!: AvailabilityWindowBody[];

  @ApiProperty({
    example: 180,
    description: 'Limite diário em minutos: de 60 a 480, múltiplo de 30.',
  })
  @IsInt()
  dailyLimitMinutes!: number;
}

export class WeeklyAvailabilityView {
  @ApiProperty({ type: [AvailabilityWindowBody] })
  windows!: AvailabilityWindow[];

  @ApiProperty({ example: 180 })
  dailyLimitMinutes!: number;
}

export class WeeklyAvailabilityResponse {
  @ApiProperty({ type: WeeklyAvailabilityView })
  availability!: WeeklyAvailabilityView;
}

export function toAvailabilityResponse(
  availability: WeeklyAvailability,
): WeeklyAvailabilityResponse {
  return {
    availability: {
      windows: availability.windows,
      dailyLimitMinutes: availability.dailyLimitMinutes,
    },
  };
}
