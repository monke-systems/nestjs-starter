import { Global, Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './logging.module-def';
import { StructuredLogger } from './nestjs-logger-fork/structured-logger';

@Module({
  providers: [StructuredLogger],
  exports: [StructuredLogger],
})
@Global()
export class LoggingModule extends ConfigurableModuleClass {}
