import { ConfigurableModuleBuilder } from '@nestjs/common';
import type { ActuatorModuleOpts } from './config';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<ActuatorModuleOpts>()
  .setExtras({ isGlobal: true })
  .setClassMethodName('forRoot')
  .build();
