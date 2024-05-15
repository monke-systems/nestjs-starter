export type ConfigModuleOpts = {
  configClass: new () => object;
  config: {
    configRootDir: string;
    configEnv?: string;
    generateDefaultConfigIfNotExist?: boolean;
    generateDocAndSchema?: boolean;
    configDocPath?: string;
  };
};
