import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './shared/errors/api-exception.filter';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalFilters(new ApiExceptionFilter());
  setupSwagger(app);
  await app.listen(process.env.PORT ?? 4000);
}

bootstrap().catch((error: unknown) => {
  new Logger('Bootstrap').error('Falha ao iniciar o backend', error);
  process.exit(1);
});
