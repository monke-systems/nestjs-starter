import { Global, Module } from '@nestjs/common';
import { ActuatorServer } from './actuator-server';
import { ConfigurableModuleClass } from './actuator.module-def';
import { ActuatorService } from './actuator.service';

@Module({
  providers: [ActuatorService, ActuatorServer],
  exports: [ActuatorService],
})
@Global()
export class ActuatorModule extends ConfigurableModuleClass {}
