import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { setupGracefulShutdown } from '../modules/graceful-shutdown';
import { LOG_LEVEL, NestJsLogger } from '../modules/logging';
import type { NestStarterConfig, SwaggerConfig } from './starter-config';

export const createStarterApp = async (
  // Typing from original interface
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  module: any,
): Promise<NestFastifyApplication> => {
  // "bufferLogs: true" nestjs feature causes silent log issue.
  // instead create toplevel logger before app init
  // const logger = createNestLogger({
  //   level: LOG_LEVEL.TRACE,
  //   prettyMode: process.env.NODE_ENV === 'development',
  //   enableHttpTracing: false,
  //   enableHttpRequestContext: false,
  // });
  const logger = new NestJsLogger({
    config: {
      level: LOG_LEVEL.VERBOSE,
      prettyMode: false,
    },
    dependencies: {},
  });

  // // @ts-expect-error this library uses internal logger
  // ClsModule.logger = logger;

  const app = await NestFactory.create<NestFastifyApplication>(
    module,
    new FastifyAdapter(),
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
  const logger = app.get(NestJsLogger);
  app.useLogger(logger);

  const config = app.get(configClass);

  app.enableShutdownHooks();

  if (config.http.gracefulShutdown.enabled) {
    await setupGracefulShutdown(app, logger);
  }

  // Should be here?
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
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
  const logger = app.get(NestJsLogger);

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
