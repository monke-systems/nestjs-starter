import type * as http from 'node:http';
import type {
  BeforeApplicationShutdown,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { Inject, Logger } from '@nestjs/common';
import { HealthcheckModuleOpts } from './config';
import { MODULE_OPTIONS_TOKEN } from './healthcheck.module-def';

export class HealthcheckService
  implements OnApplicationBootstrap, BeforeApplicationShutdown
{
  private logger = new Logger(HealthcheckService.name);
  private readinessState = true;

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private opts: HealthcheckModuleOpts,
  ) {}

  onApplicationBootstrap() {
    this.opts.dependencies.actuator.registerRoute(
      '/health',
      this.health.bind(this),
    );

    this.opts.dependencies.actuator.registerRoute(
      '/health/readiness',
      this.readiness.bind(this),
    );
  }

  beforeApplicationShutdown(signal?: string) {
    this.logger.debug(
      `Got shutdown signal ${signal}. Readiness state will be set to false`,
    );
    this.readinessState = false;
  }

  private health(req: http.IncomingMessage, res: http.ServerResponse) {
    this.logger.debug('Healthcheck request received');
    res.writeHead(200);
    res.end();
  }

  private readiness(req: http.IncomingMessage, res: http.ServerResponse) {
    const code = this.readinessState ? 200 : 503;
    this.logger.debug(`Readiness request received. Responding with ${code}`);

    res.writeHead(code);
    res.end();
  }
}
