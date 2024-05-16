import type { DynamicModule, Provider } from '@nestjs/common';
import { buildStarterConfig } from './build-starter-config';
import type { ConfigModuleOpts } from './config-module-opts';

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
          return buildStarterConfig(opts);
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
}
