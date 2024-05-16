import type { Actuator } from '@monkee/small-standards';

export type PrometheusModuleConfig = {
  enableHttpMetrics: boolean;
  defaultMetrics: boolean;
};

export type PrometheusModuleOpts = {
  config: PrometheusModuleConfig;

  dependencies: {
    actuator: Actuator;
  };
};
