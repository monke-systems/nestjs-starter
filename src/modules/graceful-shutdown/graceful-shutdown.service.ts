import { Inject, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { GracefulShutdownModuleOpts } from './config';
import { createFastifyGracefulShutdownPlugin } from './fastify-gs-plugin';
import { MODULE_OPTIONS_TOKEN } from './graceful-shutdown.module-def';

export class GracefulShutdownService implements OnApplicationBootstrap {
  private logger = new Logger(GracefulShutdownService.name);

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private opts: GracefulShutdownModuleOpts,
    private adapterHost: HttpAdapterHost,
  ) {}

  onApplicationBootstrap() {
    if (!this.opts.config.enabled) {
      return;
    }
    const adapter = this.adapterHost.httpAdapter;

    if (!(adapter instanceof FastifyAdapter)) {
      throw new Error('GracefulShutdown module only supports FastifyAdapter');
    }

    const plugin = createFastifyGracefulShutdownPlugin(this.logger);

    // @ts-expect-error https://www.fastify.io/docs/latest/Reference/Plugins/#handle-the-scope
    plugin[Symbol.for('skip-override')] = true;

    adapter.getInstance().register(plugin);
  }
}
