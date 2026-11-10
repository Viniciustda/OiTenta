import { NestFactory } from '@nestjs/core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { AppModule } from './app.module';
import { createOpenApiDocument } from './swagger';

// Gera o contrato sem subir o servidor nem conectar ao banco (modo preview do Nest).
async function exportOpenApi() {
  const app = await NestFactory.create(AppModule, {
    preview: true,
    logger: false,
  });
  const document = createOpenApiDocument(app);
  const target = resolve(
    process.cwd(),
    '../../packages/contracts/openapi.json',
  );
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(document, null, 2)}\n`);
  await app.close();
  console.log(`openapi.json exportado para ${target}`);
}

exportOpenApi().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
