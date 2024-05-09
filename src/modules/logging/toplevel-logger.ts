import type { LoggerService } from '@nestjs/common';
import { Logger, PinoLogger } from 'nestjs-pino';
import type { LoggerModuleConfig } from './config';
import { createPinoHttpOpts } from './create-pino-http-opts';

export const createNestLogger = (config: LoggerModuleConfig): LoggerService => {
  const pino = new PinoLogger({
    pinoHttp: createPinoHttpOpts(config),
  });

  return new Logger(pino, {});
};
