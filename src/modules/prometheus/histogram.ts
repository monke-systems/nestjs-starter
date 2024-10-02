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

  startTimer(
    startLabels: Record<string, string> | undefined,
  ): (endLabels?: Record<string, string>) => number {
    const start = process.hrtime();

    return (endLabels?: Record<string, string>) => {
      const delta = process.hrtime(start);
      const value = delta[0] + delta[1] / 1e9;
      this.observe(value, Object.assign({}, startLabels, endLabels));
      return value;
    };
  }
}
