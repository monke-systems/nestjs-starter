import { ConfigurableModuleBuilder } from '@nestjs/common';
import type { PrometheusModuleOpts } from './config';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<PrometheusModuleOpts>()
  .setExtras({ isGlobal: true })
  .setClassMethodName('forRoot')
  .build();
