/* eslint-disable @typescript-eslint/no-explicit-any */
import { writeFile } from 'fs/promises';
import type { BuildConfigOptions } from '@monkee/turbo-config';
import { buildConfig, generateConfigDoc } from '@monkee/turbo-config';
import type { DynamicModule, Provider } from '@nestjs/common';
import type { ConfigModuleOpts } from './config-module-opts';

export class ConfigModule {
  static async forRoot(opts: ConfigModuleOpts): Promise<DynamicModule> {
    return ConfigModule.register(opts, true);
  }

  private static async register(
    opts: ConfigModuleOpts,
    global: boolean,
  ): Promise<DynamicModule> {
    const monkeeOpts: BuildConfigOptions = {
      ymlFiles: opts.config.ymlFiles,
      envFiles: opts.config.envFiles,
      loadEnvFiles: opts.config.loadEnvFiles === true,
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

      if (opts.config.configSchemaPath !== undefined) {
        await writeFile(
          opts.config.configSchemaPath,
          JSON.stringify(jsonSchema),
          'utf-8',
        );
      }
    }

    if (validationErrors.length > 0) {
      throw new Error(
        `Config validation failed: \n${validationErrors
          .map((e) => e.toString())
          .join('\n')}`,
      );
    }

    const providers: Provider[] = [
      {
        provide: opts.configClass,
        useValue: config,
      },
    ];

    return {
      module: ConfigModule,
      exports: providers,
      providers,
      global,
    };
  }
}
