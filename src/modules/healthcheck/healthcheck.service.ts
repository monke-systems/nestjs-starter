import { Inject, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { HealthcheckModuleOpts } from './config';
import { MODULE_OPTIONS_TOKEN } from './healthcheck.module-def';

export class HealthcheckService implements OnApplicationBootstrap {
  private logger = new Logger(HealthcheckService.name);

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private opts: HealthcheckModuleOpts,
  ) {}

  onApplicationBootstrap() {
    this.opts.dependencies.actuator.registerRoute(
      '/healthcheck',
      (req, res) => {
        this.logger.verbose('Healthcheck request received');
        res.writeHead(200);
        res.end();
      },
    );
  }
}
