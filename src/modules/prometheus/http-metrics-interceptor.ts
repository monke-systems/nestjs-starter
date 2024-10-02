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
    if (!this.opts.config.enableHttpMetrics) {
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
      [
        0.005, 0.01, 0.025, 0.05, 0.1, 0, 15, 0.2, 0.25, 0.3, 0.5, 0.7, 1, 2,
        2.5, 5, 8, 10, 14, 16, 22, 28,
      ],
    );
  }

  intercept(ctx: ExecutionContext, next: CallHandler) {
    if (!this.opts.config.enableHttpMetrics) {
      return next.handle();
    }

    if (ctx.getType() !== 'http') {
      return next.handle();
    }

    const end = this.requestTime!.startTimer();

    const req = ctx.switchToHttp().getRequest() as FastifyRequest;

    return next.handle().pipe(
      catchError((err) => {
        // надеемся, что на это можно рассчитывать
        const status = err instanceof HttpException ? err.getStatus() : 500;

        end({
          method: req.method,
          uri: req.routeOptions.url ?? 'unknown',
          status: status.toString(),
        });

        throw err;
      }),
      tap(() => {
        const response = ctx.switchToHttp().getResponse() as FastifyReply;

        end({
          method: req.method,
          uri: req.routeOptions.url ?? 'unknown',
          status: response.statusCode.toString(),
        });
      }),
    );
  }
}
