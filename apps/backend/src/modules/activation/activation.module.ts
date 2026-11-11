import { Module } from '@nestjs/common';
import { FixedRampOptionSource } from '@oitenta/activation';
import { DbModule } from '../../db/db.module';
import { PrismaFocusSessionRepository } from './focus-session.prisma';

// O catálogo fixo da rampa (P16) é uma classe pura do domínio; o Nest só guarda uma instância
// para o orquestrador da rampa (C4). Os endpoints chegam na C4.
@Module({
  imports: [DbModule],
  providers: [
    PrismaFocusSessionRepository,
    { provide: FixedRampOptionSource, useValue: new FixedRampOptionSource() },
  ],
  exports: [PrismaFocusSessionRepository, FixedRampOptionSource],
})
export class ActivationModule {}
