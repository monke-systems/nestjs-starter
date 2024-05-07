import type { GaugeType } from '@monkee/small-standards';
import { Gauge } from 'prom-client';

export class PrometheusGauge implements GaugeType {
  constructor(private gauge: Gauge) {}

  set(value: number, labels?: Record<string, string>) {
    if (labels === undefined) {
      this.gauge.set(value);
    } else {
      this.gauge.set(labels, value);
    }
  }
}
