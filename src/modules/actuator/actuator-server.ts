import * as http from 'http';
import type { ActuatorRouteHandler } from '@monkee/small-standards';
import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnApplicationShutdown,
} from '@nestjs/common';

import { MODULE_OPTIONS_TOKEN } from './actuator.module-def';
import { ActuatorModuleOpts } from './config';

@Injectable()
export class ActuatorServer
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private logger = new Logger(ActuatorServer.name);
  private server: http.Server;
  private routes: Record<string, ActuatorRouteHandler> = {};

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private opts: ActuatorModuleOpts,
  ) {
    this.server = http.createServer();
  }

  registerRoute(path: string, handler: ActuatorRouteHandler) {
    const fullRoute = `/actuator${path}`;
    this.routes[fullRoute] = handler;
    this.logger.log(`Actuator registered route ${fullRoute}`);
  }

  onApplicationBootstrap() {
    this.server.on('request', (req, res) => {
      if (req.method !== 'GET') {
        res.writeHead(405);
        res.end();
        return;
      }

      if (req.url === undefined) {
        res.writeHead(400);
        res.end();
        return;
      }

      const handler = this.routes[req.url];

      if (handler !== undefined) {
        handler(req, res);
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    if (this.opts.config.enabled) {
      this.server.listen(this.opts.config.port, '0.0.0.0', () => {
        this.logger.log(`Actuator listening on port :${this.opts.config.port}`);
      });
    }
  }

  onApplicationShutdown() {
    this.server.close((e) => {
      this.logger.log(e);
    });
  }
}
