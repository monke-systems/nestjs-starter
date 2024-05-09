import type { MeterRegistryType } from '@monkee/small-standards';

export enum LOG_LEVEL {
  FATAL = 'fatal',
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace',
}

export type LoggerModuleConfig = {
  prettyMode: boolean;
  level: LOG_LEVEL;

  enableHttpTracing: boolean;
  enableHttpRequestContext: boolean;
};

export type LoggerModuleOpts = {
  config: LoggerModuleConfig;

  dependencies: {
    meterRegistry?: MeterRegistryType;
  };
};
