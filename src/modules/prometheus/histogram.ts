import type { HistogramType } from '@monkee/small-standards';
import { Histogram } from 'prom-client';

export class PrometheusHistogram implements HistogramType {
  constructor(private histogram: Histogram) {}

  observe(value: number, labels?: Record<string, string>) {
    if (labels === undefined) {
      this.histogram.observe(value);
    } else {
      this.histogram.observe(labels, value);
    }
  }
}
