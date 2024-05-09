import type { INestApplication, Logger as NestLogger } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { setupGracefulShutdown } from '../modules/graceful-shutdown';
import { createNestLogger, LOG_LEVEL } from '../modules/logging';
import { createFastifyAdapter } from './create-fastify-adapter';
import type { NestStarterConfig, SwaggerConfig } from './starter-config';

export const createStarterApp = async (
  // Typing from original interface
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  module: any,
): Promise<NestFastifyApplication> => {
  // "bufferLogs: true" nestjs feature causes silent log issue.
  // instead create toplevel logger before app init
  const logger = createNestLogger({
    level: LOG_LEVEL.TRACE,
    prettyMode: process.env.NODE_ENV === 'development',
    enableHttpTracing: false,
    enableHttpRequestContext: false,
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    module,
    createFastifyAdapter(true),
    {
      logger,
    },
  );

  return app;
};

export const initStarterApp = async <T extends NestStarterConfig>(
  app: NestFastifyApplication,
  configClass: new () => T,
): Promise<INestApplication> => {
  const logger = app.get(Logger);
  app.useLogger(logger);

  const config = app.get(configClass);

  app.enableShutdownHooks();

  if (config.http.gracefulShutdown.enabled) {
    await setupGracefulShutdown(app, logger as unknown as NestLogger);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  if (config.swagger.enabled) {
    setupSwagger(app, config.appName, config.swagger);
  }

  return Promise.resolve(app);
};

const loggerContext = 'Bootstrap';

export const startStarterApp = async <T extends NestStarterConfig>(
  app: NestFastifyApplication,
  configClass: new () => T,
): Promise<void> => {
  const config = app.get(configClass);
  const logger = app.get(Logger);

  await app.listen(config.http.port, '0.0.0.0');
  const appUrl = await app.getUrl();

  logger.log(`Listening on ${appUrl}`, loggerContext);

  if (config.swagger.enabled) {
    logger.log(`Swagger available on ${appUrl}/doc/#`, loggerContext);
    logger.log(`Swagger json schema on ${appUrl}/doc-json`, loggerContext);
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
