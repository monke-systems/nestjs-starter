import type { Actuator } from '@monkee/small-standards';

export type HealthcheckModuleConfig = {
  enabled: boolean;
};

export type HealthcheckModuleOpts = {
  config: HealthcheckModuleConfig;

  dependencies: {
    actuator: Actuator;
  };
};
