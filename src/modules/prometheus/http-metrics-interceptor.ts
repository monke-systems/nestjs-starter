import { performance } from 'perf_hooks';
import type { HistogramType } from '@monkee/small-standards';
import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpAdapterHost } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { catchError, tap } from 'rxjs/operators';
import { PrometheusModuleOpts } from './config';
import { PrometheusRegistry } from './prometheus-registry';
import { MODULE_OPTIONS_TOKEN } from './prometheus.module-def';

export class HttpMetricsInterceptor implements NestInterceptor {
  private requestTime?: HistogramType;

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private opts: PrometheusModuleOpts,
    private registry: PrometheusRegistry,
    private adapterHost: HttpAdapterHost,
  ) {
    if (!this.opts.config.enabled || !this.opts.config.enableHttpMetrics) {
      return;
    }

    const adapter = this.adapterHost.httpAdapter;

    if (adapter === undefined) {
      throw new Error(
        'HttpMetricsInterceptor requires HttpAdapter. Make sure you have HttpAdapter registered in your application',
      );
    }

    if (!(adapter instanceof FastifyAdapter)) {
      throw new Error('HttpMetricsInterceptor only supports FastifyAdapter');
    }

    this.requestTime = this.registry.createHistogram(
      'nest_http_requests_seconds',
      'Http server request time seconds',
      ['method', 'uri', 'status'],
    );
  }

  intercept(ctx: ExecutionContext, next: CallHandler) {
    if (!this.opts.config.enabled || !this.opts.config.enableHttpMetrics) {
      return next.handle();
    }

    if (ctx.getType() !== 'http') {
      return next.handle();
    }

    const start = performance.now();

    const req = ctx.switchToHttp().getRequest() as FastifyRequest;

    return next.handle().pipe(
      catchError((err) => {
        const end = performance.now();
        const duration = end - start;

        // надеемся, что на это можно рассчитывать
        const status = err instanceof HttpException ? err.getStatus() : 500;

        this.requestTime!.observe(duration / 1000, {
          method: req.method,
          uri: req.routeOptions.url ?? 'unknown',
          status: status.toString(),
        });

        throw err;
      }),
      tap(() => {
        const end = performance.now();
        const duration = end - start;

        const response = ctx.switchToHttp().getResponse() as FastifyReply;

        this.requestTime!.observe(duration / 1000, {
          method: req.method,
          uri: req.routeOptions.url ?? 'unknown',
          status: response.statusCode.toString(),
        });
      }),
    );
  }
}
