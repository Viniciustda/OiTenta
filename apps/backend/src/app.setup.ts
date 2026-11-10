import { INestApplication } from '@nestjs/common';
import { ApiExceptionFilter } from './shared/errors/api-exception.filter';

// Configuração única da aplicação, usada pelo main.ts e pelos testes de integração.
export function configureApp(app: INestApplication): void {
  app.enableCors();
  app.useGlobalFilters(new ApiExceptionFilter());
}
