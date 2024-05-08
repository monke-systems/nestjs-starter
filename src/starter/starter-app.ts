import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import type { NestStarterConfig, SwaggerConfig } from './starter-config';

export const createStarterApp = async (
  // Typing from original interface
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  module: any,
): Promise<NestFastifyApplication> => {
  const app = await NestFactory.create<NestFastifyApplication>(
    module,
    new FastifyAdapter(),
  );

  return app;
};

export const initStarterApp = <T extends NestStarterConfig>(
  app: NestFastifyApplication,
  configClass: new () => T,
): INestApplication => {
  const logger = app.get(Logger);
  app.useLogger(logger);

  const config = app.get(configClass);

  if (config.http.corsOrigin !== undefined) {
    app.enableCors({
      origin: config.http.corsOrigin,
    });
  }

  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  if (config.swagger.enabled) {
    setupSwagger(app, config.appName, config.swagger);
  }

  return app;
};

export const startStarterApp = async <T extends NestStarterConfig>(
  app: NestFastifyApplication,
  configClass: new () => T,
): Promise<void> => {
  const config = app.get(configClass);
  const logger = app.get(Logger);

  await app.listen(config.http.port, '0.0.0.0');
  const appUrl = await app.getUrl();

  logger.log(`Listening on ${appUrl}`);

  if (config.swagger.enabled) {
    logger.log(`Swagger available on ${appUrl}/doc/#`);
    logger.log(`Swagger json schema on ${appUrl}/doc-json`);
  }
};

const setupSwagger = (
  app: INestApplication,
  appName: string,
  config: SwaggerConfig,
) => {
  const optionsBuilder = new DocumentBuilder().setTitle(appName);

  const options = optionsBuilder.build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(config.path, app, document);
};
