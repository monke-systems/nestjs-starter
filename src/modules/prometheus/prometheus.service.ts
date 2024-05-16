import type { OnApplicationBootstrap } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PrometheusModuleOpts } from './config';
import { PrometheusRegistry } from './prometheus-registry';
import { MODULE_OPTIONS_TOKEN } from './prometheus.module-def';

export class PrometheusService implements OnApplicationBootstrap {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private opts: PrometheusModuleOpts,
    private registry: PrometheusRegistry,
  ) {}

  onApplicationBootstrap() {
    this.opts.dependencies.actuator.registerRoute(
      '/prometheus',
      async (req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        const metrics = await this.registry.metrics();
        res.end(metrics);
      },
    );
  }
}
