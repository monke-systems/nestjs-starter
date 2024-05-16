import type { Actuator } from '@monkee/small-standards';

export type HealthcheckModuleOpts = {
  dependencies: {
    actuator: Actuator;
  };
};
