import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ApiExceptionFilter } from './shared/errors/api-exception.filter';

// Configuração única da aplicação, usada pelo main.ts e pelos testes de integração.
export function configureApp(app: INestApplication): void {
  app.enableCors();
  // P19: formato ou tipo inválido, ou campo não previsto → 400; regra de domínio → 422.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());
}
