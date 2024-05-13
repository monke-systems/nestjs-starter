import * as util from 'node:util';
import { Inject, Injectable } from '@nestjs/common';
import { ConsoleLogger as NestConsole } from '@nestjs/common/services/console-logger.service';
import { ClsService } from 'nestjs-cls';
import { LoggerModuleOpts } from './config';
import { MODULE_OPTIONS_TOKEN } from './logger.module-def';
import { isString } from './ref/shared.utils';

@Injectable()
export class NestJsLogger extends NestConsole {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private opts: LoggerModuleOpts,
    private readonly cls?: ClsService,
  ) {
    super();
  }

  log(message: any, context?: string): void;
  log(message: any, ...optionalParams: [...any, string?]): void;
  log(message: any, ...optionalParams: any[]) {
    const { messages, context } = this.parseContextAndMessages([
      message,
      ...optionalParams,
    ]);

    if (!this.opts.config.prettyMode) {
      this.printJsonMessages(messages, 'log', context);
    } else {
      this.printMessages(messages, context, 'log');
    }
  }

  debug(message: any, context?: string): void;
  debug(message: any, ...optionalParams: [...any, string?]): void;
  debug(message: any, ...optionalParams: any[]) {
    const { messages, context } = this.parseContextAndMessages([
      message,
      ...optionalParams,
    ]);

    if (!this.opts.config.prettyMode) {
      this.printJsonMessages(messages, 'debug', context);
    } else {
      this.printMessages(messages, context, 'debug');
    }
  }

  private printJsonMessages(messages: any[], level: string, context?: string) {
    const message = messages
      .map((m) => {
        return util.format(m);
      })
      .join(' ');

    const json = JSON.stringify({
      context,
      message,
      level,
      timestamp: Date.now(),
      traceId: this.cls?.getId(),
    });

    process.stdout.write(`${json}\n`);
  }

  private parseContextAndMessages(args: unknown[]) {
    if (args?.length <= 1) {
      return { messages: args, context: this.context };
    }
    const lastElement = args[args.length - 1];
    const isContext = isString(lastElement);
    if (!isContext) {
      return { messages: args, context: this.context };
    }
    return {
      context: lastElement as string,
      messages: args.slice(0, args.length - 1),
    };
  }
}
