export type ActuatorModuleConfig = {
  enabled: boolean;
  port: number;
};

export type ActuatorModuleOpts = {
  config: ActuatorModuleConfig;
};
