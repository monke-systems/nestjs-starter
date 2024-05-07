import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrometheusRegistry } from './prometheus-registry';
import { ConfigurableModuleClass } from './prometheus.module-def';
import { PrometheusService } from './prometheus.service';
import { RestMetricsInterceptor } from './rest-metrics-interceptor';

@Module({
  providers: [
    PrometheusRegistry,
    PrometheusService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RestMetricsInterceptor,
    },
  ],
  exports: [PrometheusRegistry],
})
@Global()
export class PrometheusModule extends ConfigurableModuleClass {}
