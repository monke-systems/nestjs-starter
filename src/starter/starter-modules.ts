import { randomUUID } from 'node:crypto';
import type { RawRequestDefaultExpression } from 'fastify';
import { ClsModule } from 'nestjs-cls';
import { ActuatorModule, ActuatorService } from '../modules/actuator';
import { ConfigModule } from '../modules/config';
import { HealthcheckModule } from '../modules/healthcheck';
import { LoggingModule } from '../modules/logging';
import { PrometheusModule, PrometheusRegistry } from '../modules/prometheus';
import type { NestStarterConfig } from './starter-config';

export const createStarterModules = <T extends NestStarterConfig>(
  configClass: new () => T,
) => {
  return [
    ConfigModule.forRoot({
      configClass,
      config: {
        configRootDir: process.env.NEST_CONFIG_ROOT ?? 'src/resources',
        configEnv: process.env.NEST_CONFIG_ENV,
        generateDocAndSchema: process.env.NEST_CONFIG_GENERATE_REF === 'true',
        generateDefaultConfigIfNotExist: process.env.NODE_ENV === 'development',
        configDocPath: 'CONFIG_REFERENCE.MD',
      },
    }),
    ActuatorModule.forRootAsync({
      inject: [configClass],
      useFactory: (config: NestStarterConfig) => ({
        config: config.actuator,
      }),
    }),
    PrometheusModule.forRootAsync({
      inject: [ActuatorService, configClass],
      useFactory: (actuator: ActuatorService, config: NestStarterConfig) => ({
        config: config.prometheus,
        dependencies: {
          actuator,
        },
      }),
    }),
    HealthcheckModule.forRootAsync({
      inject: [ActuatorService, configClass],
      useFactory: (actuator: ActuatorService, config: NestStarterConfig) => ({
        config: config.healthcheck,
        dependencies: {
          actuator,
        },
      }),
    }),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: RawRequestDefaultExpression) => {
          const fromHeaders = req.headers['x-request-id'];

          if (fromHeaders !== undefined) {
            if (Array.isArray(fromHeaders)) {
              if (fromHeaders[0] !== undefined) {
                return fromHeaders[0];
              }
            } else {
              return fromHeaders;
            }
          }

          return randomUUID();
        },
      },
    }),
    LoggingModule.forRootAsync({
      inject: [configClass, PrometheusRegistry],
      useFactory: (
        { logging }: NestStarterConfig,
        meterRegistry: PrometheusRegistry,
      ) => {
        return {
          config: logging,
          dependencies: {
            meterRegistry,
          },
        };
      },
    }),
  ];
};
