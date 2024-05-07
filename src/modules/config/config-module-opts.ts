export type ConfigModuleOpts = {
  configClass: new () => object;
  config: {
    generateDocAndSchema?: boolean;
    configDocPath?: string;
    configSchemaPath?: string;
    loadEnvFiles?: boolean;
    ymlFiles?: string[];
    envFiles?: string[];
  };
};
