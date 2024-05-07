import type { Actuator, ActuatorRouteHandler } from '@monkee/small-standards';
import { Injectable } from '@nestjs/common';
import { ActuatorServer } from './actuator-server';

@Injectable()
export class ActuatorService implements Actuator {
  constructor(private server: ActuatorServer) {}

  registerRoute(path: string, handler: ActuatorRouteHandler) {
    this.server.registerRoute(path, handler);
  }
}
