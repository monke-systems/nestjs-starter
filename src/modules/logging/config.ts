import type { MeterRegistryType } from '@monkee/small-standards';

export enum LOG_LEVEL {
  FATAL = 'fatal',
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

export type LoggerModuleConfig = {
  prettyMode: boolean;
  level: LOG_LEVEL;
};

export type LoggerModuleOpts = {
  config: LoggerModuleConfig;

  dependencies: {
    meterRegistry?: MeterRegistryType;
  };
};
