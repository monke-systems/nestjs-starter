import type { CounterType } from '@monkee/small-standards';
import { Counter } from 'prom-client';

export class PrometheusCounter implements CounterType {
  constructor(private counter: Counter) {}

  increment(value = 1, labels?: Record<string, string>) {
    if (labels === undefined) {
      this.counter.inc(value);
    } else {
      this.counter.inc(labels, value);
    }
  }

  reset() {
    this.counter.reset();
  }
}
