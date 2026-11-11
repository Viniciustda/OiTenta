import { Module } from '@nestjs/common';

// Orquestradores (docs/3-modelagem-dominio.md §5): um arquivo por fluxo, só encadeiam casos de uso.
// As rotas que dependem de mais de um módulo moram aqui (tarefa C4).
@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class OrchestratorsModule {}
