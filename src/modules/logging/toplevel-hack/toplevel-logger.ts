import type { LoggerService } from '@nestjs/common';
import pino from 'pino';
import type { LoggerModuleConfig } from '../config';
import { createPinoHttpOpts } from '../create-pino-http-opts';
import { ToplvlNestLogger } from './toplvl-nest-logger';
import { ToplvlPinoLogger } from './toplvl-pino-logger';

export const createNestLogger = (config: LoggerModuleConfig): LoggerService => {
  const pinoInstance = pino({
    ...createPinoHttpOpts(config),
  });

  const pinoAdapter = new ToplvlPinoLogger('context', pinoInstance);

  return new ToplvlNestLogger(pinoAdapter, 'context');

  // return new Logger(pino, {});
};
