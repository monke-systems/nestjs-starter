import { ConfigField, ConfigPrefix } from '@monkee/turbo-config';
import { Injectable } from '@nestjs/common';
import { IsEnum, Max, Min } from 'class-validator';
import type { ActuatorModuleConfig } from '../modules/actuator';
import type { GracefulShutdownModuleConfig } from '../modules/graceful-shutdown';
import type { HealthcheckModuleConfig } from '../modules/healthcheck';
import type { PrometheusModuleConfig } from '../modules/prometheus';

export enum LOG_LEVEL {
  FATAL = 'fatal',
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace',
}

export class LoggingConfig {
  @ConfigField()
  prettyMode!: boolean;

  @ConfigField()
  @IsEnum(LOG_LEVEL)
  level!: LOG_LEVEL;

  @ConfigField()
  traceHttp!: boolean;
}

export class HttpServerConfig {
  @ConfigField()
  @Min(0)
  @Max(65535)
  port!: number;

  @ConfigField({ optional: true })
  corsOrigin?: string;
}

export class ActuatorConfig implements ActuatorModuleConfig {
  @ConfigField()
  enabled!: boolean;

  @ConfigField()
  port!: number;
}

export class PrometheusConfig implements PrometheusModuleConfig {
  @ConfigField()
  enabled!: boolean;

  @ConfigField()
  collectDefaultMetrics!: boolean;

  @ConfigField()
  httpRestMetrics!: boolean;
}

export class GracefulShutdownConfig implements GracefulShutdownModuleConfig {
  @ConfigField()
  enabled!: boolean;
}

export class HealthcheckConfig implements HealthcheckModuleConfig {
  @ConfigField()
  enabled!: boolean;
}

export class SwaggerConfig {
  @ConfigField()
  enabled!: boolean;

  @ConfigField()
  path!: string;
}

@ConfigPrefix('nest')
@Injectable()
export class NestStarterConfig {
  @ConfigField()
  appName!: string;

  @ConfigField({ nested: true })
  http!: HttpServerConfig;

  @ConfigField({ nested: true })
  logging!: LoggingConfig;

  @ConfigField({ nested: true })
  actuator!: ActuatorConfig;

  @ConfigField({ nested: true })
  prometheus!: PrometheusConfig;

  @ConfigField({ nested: true })
  gracefulShutdown!: GracefulShutdownConfig;

  @ConfigField({ nested: true })
  healthcheck!: HealthcheckConfig;

  @ConfigField({ nested: true })
  swagger!: SwaggerConfig;
}
