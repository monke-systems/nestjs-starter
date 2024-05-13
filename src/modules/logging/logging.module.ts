import { Global, Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './logger.module-def';
import { NestJsLogger } from './nestjs-logger';

@Module({
  providers: [NestJsLogger],
  exports: [NestJsLogger],
})
@Global()
export class LoggingModule extends ConfigurableModuleClass {}
