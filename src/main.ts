import { NestFactory } from '@nestjs/core';
import { Database, Redis } from 'cms-lib-database';
import { config as resourcesConfig } from 'cms-lib-resources';
import { config } from '@shared/environments/load-env.js';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const { port } = config.server;
  const { corsOrigin } = resourcesConfig.server;

  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: false,
  });
  app.setGlobalPrefix('ms-cms');

  await app.listen(port!);
  await Database.connect();
  await Redis.connect();

  console.info(`MS-CMS iniciado en el puerto: ${port}`);
}
await bootstrap();
