import { LoggerModule } from 'nestjs-pino';
import { ActuatorModule, ActuatorService } from '../modules/actuator';
import { ConfigModule } from '../modules/config';
import { GracefulShutdownModule } from '../modules/graceful-shutdown';
import { HealthcheckModule } from '../modules/healthcheck';
import { createPinoHttpOpts } from '../modules/logging';
import { PrometheusModule, PrometheusRegistry } from '../modules/prometheus';
import type { NestStarterConfig } from './starter-config';

export const createStarterModules = <T extends NestStarterConfig>(
  configClass: new () => T,
) => {
  return [
    ConfigModule.forRoot({
      configClass,
      config: {
        ymlFiles: [
          'src/resources/default-config.yml',
          'resources/default-config.yml',
        ],
        generateDocAndSchema: process.env.NODE_ENV === 'development',
        configDocPath: 'CONFIG_REFERENCE.MD',
        configSchemaPath: 'src/resources/config-schema.json',
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
    GracefulShutdownModule.forRootAsync({
      inject: [configClass],
      useFactory: (config: NestStarterConfig) => ({
        config: config.http.gracefulShutdown,
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
    LoggerModule.forRootAsync({
      inject: [configClass, PrometheusRegistry],
      useFactory: (
        { logging }: NestStarterConfig,
        registry: PrometheusRegistry,
      ) => {
        return {
          pinoHttp: createPinoHttpOpts(logging, registry),
        };
      },
    }),
  ];
};
