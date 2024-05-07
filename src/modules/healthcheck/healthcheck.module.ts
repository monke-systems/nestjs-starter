import { Global, Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './healthcheck.module-def';
import { HealthcheckService } from './healthcheck.service';

@Module({
  providers: [HealthcheckService],
})
@Global()
export class HealthcheckModule extends ConfigurableModuleClass {}
