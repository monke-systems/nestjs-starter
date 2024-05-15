import * as fs from 'fs/promises';
import { writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import type { BuildConfigOptions } from '@monkee/turbo-config';
import { buildConfig, generateConfigDoc } from '@monkee/turbo-config';
import type { DynamicModule, Provider } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import type { JSONSchema7 } from 'json-schema';
import type { ConfigModuleOpts } from './config-module-opts';
import { defaultConfigText } from './default-config-text';

const DEFAULT_CONFIG_NAME = 'config.default.yml';

export class ConfigModule {
  static forRoot(opts: ConfigModuleOpts): DynamicModule {
    return ConfigModule.register(opts, true);
  }

  private static register(
    opts: ConfigModuleOpts,
    global: boolean,
  ): DynamicModule {
    const providers: Provider[] = [
      {
        provide: opts.configClass,
        useFactory: (): Promise<object> => {
          return ConfigModule.buildConfig(opts);
        },
      },
    ];

    return {
      module: ConfigModule,
      exports: providers,
      providers,
      global,
    };
  }

  private static async buildConfig(opts: ConfigModuleOpts): Promise<object> {
    const logger = new Logger(ConfigModule.name);

    let defaultConfigPath: string | undefined;
    try {
      defaultConfigPath = await ConfigModule.getValidatedConfigPath(
        opts.config.configRootDir,
        DEFAULT_CONFIG_NAME,
      );
    } catch (e) {
      if (opts.config.generateDefaultConfigIfNotExist === true) {
        logger.warn(
          `Default config file not found: ${DEFAULT_CONFIG_NAME}. Generating empty config file`,
        );
        await ConfigModule.generateDefaultConfigFile(opts.config.configRootDir);
        defaultConfigPath = await ConfigModule.getValidatedConfigPath(
          opts.config.configRootDir,
          DEFAULT_CONFIG_NAME,
        );
      } else {
        throw e;
      }
    }

    const ymlFiles = [defaultConfigPath];

    if (opts.config.configEnv !== undefined) {
      const envConfigPath = await ConfigModule.getValidatedConfigPath(
        opts.config.configRootDir,
        `config.${opts.config.configEnv}.yml`,
      );

      ymlFiles.push(envConfigPath);
    }

    const monkeeOpts: BuildConfigOptions = {
      ymlFiles,
      envFiles: [],
      loadEnvFiles: false,
      throwOnValidationError: false,
      throwIfYmlNotExist: false,
      throwIfEnvFileNotExist: false,
    };

    const { config, jsonSchema, validationErrors } = await buildConfig(
      opts.configClass,
      monkeeOpts,
    );

    if (opts.config.generateDocAndSchema === true) {
      if (opts.config.configDocPath !== undefined) {
        await generateConfigDoc(jsonSchema, {
          writeToFile: opts.config.configDocPath,
        });
      }

      const configSchemaPath = path.resolve(
        opts.config.configRootDir,
        'config.schema.json',
      );

      ConfigModule.makeAllJsonSchemaFieldsOptional(jsonSchema);

      await writeFile(configSchemaPath, JSON.stringify(jsonSchema), 'utf-8');
    }

    if (validationErrors.length > 0) {
      throw new Error(
        `Config validation failed: \n${validationErrors
          .map((e) => e.toString())
          .join('\n')}`,
      );
    }

    return config;
  }

  private static async getValidatedConfigPath(
    rootDir: string,
    fileName: string,
  ): Promise<string> {
    const fullPath = path.resolve(rootDir, fileName);

    try {
      await fs.access(fullPath, fs.constants.F_OK);
    } catch (e) {
      throw new Error(
        `Nest config file not found or access denied: ${fullPath}`,
      );
    }

    return fullPath;
  }

  private static async generateDefaultConfigFile(rootDir: string) {
    const defaultConfigPath = path.resolve(rootDir, DEFAULT_CONFIG_NAME);

    await fs.mkdir(rootDir, { recursive: true });

    await writeFile(defaultConfigPath, defaultConfigText, 'utf-8');
  }

  private static makeAllJsonSchemaFieldsOptional = (schema: JSONSchema7) => {
    if (schema.required !== undefined) {
      schema.required = undefined;
    }

    if (schema.properties !== undefined) {
      for (const key of Object.keys(schema.properties)) {
        const prop = schema.properties[key] as JSONSchema7;

        if (prop.type === 'object') {
          ConfigModule.makeAllJsonSchemaFieldsOptional(prop);
        } else {
          prop.required = undefined;
        }
      }
    }
  };
}
