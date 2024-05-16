export type ConfigModuleOpts<TConfig extends object> = {
  configClass: new () => TConfig;
  config: {
    configRootDir: string;
    configEnv?: string;
    generateDefaultConfigIfNotExist?: boolean;
    generateDocAndSchema?: boolean;
    configDocPath?: string;
  };
};
