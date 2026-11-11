import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  setupSwagger(app);
  await app.listen(process.env.PORT ?? 4000);
}

bootstrap().catch((error: unknown) => {
  new Logger('Bootstrap').error('Falha ao iniciar o backend', error);
  process.exit(1);
});
