import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HttpMetricsInterceptor } from './http-metrics-interceptor';
import { PrometheusRegistry } from './prometheus-registry';
import { ConfigurableModuleClass } from './prometheus.module-def';
import { PrometheusService } from './prometheus.service';

@Module({
  providers: [
    PrometheusRegistry,
    PrometheusService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpMetricsInterceptor,
    },
  ],
  exports: [PrometheusRegistry],
})
@Global()
export class PrometheusModule extends ConfigurableModuleClass {}
