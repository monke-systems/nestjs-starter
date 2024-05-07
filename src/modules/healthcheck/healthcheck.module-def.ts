import { ConfigurableModuleBuilder } from '@nestjs/common';
import type { HealthcheckModuleOpts } from './config';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<HealthcheckModuleOpts>()
  .setExtras({ isGlobal: true })
  .setClassMethodName('forRoot')
  .build();
