import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import type { NestStarterConfig, SwaggerConfig } from './starter-config';

export const starterBootstrap = <T extends NestStarterConfig>(
  configClass: new () => T,
  app: INestApplication,
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
