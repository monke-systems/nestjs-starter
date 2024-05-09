import type { CounterType } from '@monkee/small-standards';
import { MeterRegistryType } from '@monkee/small-standards';

export class PinoMetrics {
  private logsEvents: CounterType;

  private static levelMappings: Record<number, string> = {
    10: 'trace',
    20: 'debug',
    30: 'info',
    40: 'warn',
    50: 'error',
    60: 'fatal',
  };

  constructor(registry: MeterRegistryType) {
    this.logsEvents = registry.createCounter(
      'nest_log_events_total',
      'Total count of log events',
      ['level'],
    );
  }

  incrementLogEvent(level: number) {
    const levelName = PinoMetrics.levelMappings[level];

    this.logsEvents.increment(1, { level: levelName ?? 'unknown' });
  }
}
