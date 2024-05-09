import type { MeterRegistryType } from '@monkee/small-standards';
import type { Options } from 'pino-http';
import type { LoggerModuleConfig } from './config';
import { PinoMetrics } from './pino-metrics';

export const createPinoHttpOpts = (
  config: LoggerModuleConfig,
  registry?: MeterRegistryType,
): Options => {
  let metrics: PinoMetrics | undefined;

  if (registry !== undefined) {
    metrics = new PinoMetrics(registry);
  }

  return {
    // disable pid and hostname
    base: undefined,
    level: config.level,
    messageKey: 'message',
    // // Default numeric levels is not human-readable and not supported by logging tools well
    // // https://github.com/grafana/grafana/blob/master/packages/grafana-data/src/types/logs.ts#L9-L27
    formatters: {
      level(label) {
        return { level: label };
      },
    },
    transport: config.prettyMode
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            levelFirst: true,
            messageKey: 'message',
          },
        }
      : undefined,
    autoLogging: config.enableHttpTracing,
    quietReqLogger: !config.enableHttpRequestContext,
    hooks: {
      logMethod(inputArgs, method, level) {
        metrics?.incrementLogEvent(level);
        return method.apply(this, inputArgs);
      },
    },
    customAttributeKeys: {
      reqId: 'traceId',
    },
  };
};
