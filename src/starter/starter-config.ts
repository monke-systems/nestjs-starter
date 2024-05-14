import { ConfigField, ConfigPrefix } from '@monkee/turbo-config';
import { Injectable } from '@nestjs/common';
import { IsEnum, Max, Min } from 'class-validator';
import type { ActuatorModuleConfig } from '../modules/actuator';
import type { GracefulShutdownModuleConfig } from '../modules/graceful-shutdown';
import type { HealthcheckModuleConfig } from '../modules/healthcheck';
import type { LoggingModuleConfig } from '../modules/logging';
import { LOG_LEVEL } from '../modules/logging';
import type { PrometheusModuleConfig } from '../modules/prometheus';

export class LoggingConfig implements LoggingModuleConfig {
  @ConfigField()
  prettyMode!: boolean;

  @ConfigField()
  @IsEnum(LOG_LEVEL)
  level!: LOG_LEVEL;

  @ConfigField()
  enableHttpRequestContext!: boolean;

  @ConfigField()
  enableHttpTracing!: boolean;
}

export class GracefulShutdownConfig implements GracefulShutdownModuleConfig {
  @ConfigField()
  enabled!: boolean;
}

export class HttpServerConfig {
  @ConfigField()
  @Min(0)
  @Max(65535)
  port!: number;

  @ConfigField({ nested: true })
  gracefulShutdown!: GracefulShutdownConfig;
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
  defaultMetrics!: boolean;

  @ConfigField()
  enableHttpMetrics!: boolean;
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
  healthcheck!: HealthcheckConfig;

  @ConfigField({ nested: true })
  swagger!: SwaggerConfig;
}
