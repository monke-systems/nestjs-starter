import { Global, Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './graceful-shutdown.module-def';
import { GracefulShutdownService } from './graceful-shutdown.service';

@Module({
  providers: [GracefulShutdownService],
})
@Global()
export class GracefulShutdownModule extends ConfigurableModuleClass {}
