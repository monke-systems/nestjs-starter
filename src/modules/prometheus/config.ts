import type { Actuator } from '@monkee/small-standards';

export type PrometheusModuleConfig = {
  enabled: boolean;
  enableHttpMetrics: boolean;
  defaultMetrics: boolean;
};

export type PrometheusModuleOpts = {
  config: PrometheusModuleConfig;

  dependencies: {
    actuator: Actuator;
  };
};
