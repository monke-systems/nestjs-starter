import { ConfigurableModuleBuilder } from '@nestjs/common';
import type { GracefulShutdownModuleOpts } from './config';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<GracefulShutdownModuleOpts>()
  .setExtras({ isGlobal: true })
  .setClassMethodName('forRoot')
  .build();
