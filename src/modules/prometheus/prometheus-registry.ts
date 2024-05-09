import type {
  CounterType,
  GaugeType,
  HistogramType,
  MeterRegistryType,
} from '@monkee/small-standards';
import { Inject } from '@nestjs/common';
import type { HistogramConfiguration } from 'prom-client';
import * as client from 'prom-client';

import { PrometheusModuleOpts } from './config';
import { PrometheusCounter } from './counter';
import { PrometheusGauge } from './gauge';
import { PrometheusHistogram } from './histogram';
import { MODULE_OPTIONS_TOKEN } from './prometheus.module-def';

export class PrometheusRegistry implements MeterRegistryType {
  private registry: client.Registry;

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private opts: PrometheusModuleOpts,
  ) {
    this.registry = new client.Registry();

    if (opts.config.defaultMetrics) {
      client.collectDefaultMetrics({ register: this.registry });
    }
  }

  createCounter(name: string, help: string, labels: string[]): CounterType {
    const counter = new client.Counter({
      name,
      help,
      labelNames: labels,
    });

    this.registry.registerMetric(counter);

    return new PrometheusCounter(counter);
  }

  createGauge(name: string, help: string, labels: string[]): GaugeType {
    const gauge = new client.Gauge({
      name,
      help,
      labelNames: labels,
    });

    this.registry.registerMetric(gauge);

    return new PrometheusGauge(gauge);
  }

  createHistogram(
    name: string,
    help: string,
    labels: string[],
    buckets?: number[],
  ): HistogramType {
    const conf: HistogramConfiguration<string> = {
      name,
      help,
      labelNames: labels,
    };

    if (buckets !== undefined) {
      conf.buckets = buckets;
    }

    const histogram = new client.Histogram(conf);

    this.registry.registerMetric(histogram);

    return new PrometheusHistogram(histogram);
  }

  async metrics(): Promise<string> {
    return this.registry.metrics();
  }
}
