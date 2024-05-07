import type { Actuator } from '@monkee/small-standards';

export type PrometheusModuleConfig = {
  enabled: boolean;
  httpRestMetrics: boolean;
  collectDefaultMetrics: boolean;
};

export type PrometheusModuleOpts = {
  config: PrometheusModuleConfig;

  dependencies: {
    actuator: Actuator;
  };
};
