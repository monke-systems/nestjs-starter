/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as util from 'node:util';
import type { CounterType } from '@monkee/small-standards';
import type { LoggerService } from '@nestjs/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { LOG_LEVEL, LoggerModuleOpts } from '../config';
import { MODULE_OPTIONS_TOKEN } from '../logging.module-def';
import type { StructuredLog } from '../structured-log';
import { clc, yellow } from './cli-colors.util';
import { isFunction, isPlainObject, isString, isUndefined } from './utils';

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hourCycle: 'h23',
});

const logLevelsSorted: LOG_LEVEL[] = [
  LOG_LEVEL.VERBOSE,
  LOG_LEVEL.DEBUG,
  LOG_LEVEL.INFO,
  LOG_LEVEL.WARN,
  LOG_LEVEL.ERROR,
  LOG_LEVEL.FATAL,
];

const defaultLevels: LogLevelSettings = {
  [LOG_LEVEL.VERBOSE]: false,
  [LOG_LEVEL.DEBUG]: false,
  [LOG_LEVEL.INFO]: false,
  [LOG_LEVEL.WARN]: false,
  [LOG_LEVEL.ERROR]: false,
  [LOG_LEVEL.FATAL]: false,
};

type LogLevelSettings = {
  [key in LOG_LEVEL]: boolean;
};

const getSettingsByLevel = (level: LOG_LEVEL): LogLevelSettings => {
  const enabledIndex = logLevelsSorted.findIndex((l) => l === level);

  return logLevelsSorted.reduce<LogLevelSettings>((acc, l, index) => {
    acc[l] = index >= enabledIndex;
    return acc;
  }, defaultLevels);
};

@Injectable()
export class StructuredLogger implements LoggerService {
  private readonly levelSettings: LogLevelSettings;
  private logEventsCounter?: CounterType;

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private opts: LoggerModuleOpts,
    private readonly cls?: ClsService,
  ) {
    this.levelSettings = getSettingsByLevel(opts.config.level);

    if (opts.dependencies.meterRegistry !== undefined) {
      this.logEventsCounter = opts.dependencies.meterRegistry.createCounter(
        'nest_log_events_total',
        'Total count of log events',
        ['level'],
      );
    }
  }

  /**
   * Write a 'log' level log, if the configured level allows for it.
   * Prints to `stdout` with newline.
   */
  log(message: any, context?: string): void;
  log(message: any, ...optionalParams: [...any, string?]): void;
  log(message: any, ...optionalParams: any[]) {
    this.logInternal(LOG_LEVEL.INFO, message, ...optionalParams);
  }

  /**
   * Write an 'error' level log, if the configured level allows for it.
   * Prints to `stderr` with newline.
   */
  error(message: any, stackOrContext?: string): void;
  error(message: any, stack?: string, context?: string): void;
  error(message: any, ...optionalParams: [...any, string?, string?]): void;
  error(message: any, ...optionalParams: any[]) {
    this.logInternal(LOG_LEVEL.ERROR, message, ...optionalParams);
  }

  /**
   * Write a 'warn' level log, if the configured level allows for it.
   * Prints to `stdout` with newline.
   */
  warn(message: any, context?: string): void;
  warn(message: any, ...optionalParams: [...any, string?]): void;
  warn(message: any, ...optionalParams: any[]) {
    this.logInternal(LOG_LEVEL.WARN, message, ...optionalParams);
  }

  /**
   * Write a 'debug' level log, if the configured level allows for it.
   * Prints to `stdout` with newline.
   */
  debug(message: any, context?: string): void;
  debug(message: any, ...optionalParams: [...any, string?]): void;
  debug(message: any, ...optionalParams: any[]) {
    this.logInternal(LOG_LEVEL.DEBUG, message, ...optionalParams);
  }

  /**
   * Write a 'verbose' level log, if the configured level allows for it.
   * Prints to `stdout` with newline.
   */
  verbose(message: any, context?: string): void;
  verbose(message: any, ...optionalParams: [...any, string?]): void;
  verbose(message: any, ...optionalParams: any[]) {
    this.logInternal(LOG_LEVEL.VERBOSE, message, ...optionalParams);
  }

  /**
   * Write a 'fatal' level log, if the configured level allows for it.
   * Prints to `stdout` with newline.
   */
  fatal(message: any, context?: string): void;
  fatal(message: any, ...optionalParams: [...any, string?]): void;
  fatal(message: any, ...optionalParams: any[]) {
    this.logInternal(LOG_LEVEL.FATAL, message, ...optionalParams);
  }

  private logInternal(
    level: LOG_LEVEL,
    message: any,
    ...optionalParams: any[]
  ) {
    if (!this.levelSettings[level]) {
      return;
    }

    this.logEventsCounter?.increment(1, { level });

    if (this.opts.config.prettyMode) {
      if (level === LOG_LEVEL.ERROR) {
        const { messages, context, stack } =
          this.getContextAndStackAndMessagesToPrint([
            message,
            ...optionalParams,
          ]);

        this.printMessages(messages, context, level, 'stderr');
        this.printStackTrace(stack!);
      } else {
        const { messages, context } = this.getContextAndMessagesToPrint([
          message,
          ...optionalParams,
        ]);

        this.printMessages(messages, context, level);
      }
    } else {
      const structured = this.getStructuredLog(
        level,
        message,
        ...optionalParams,
      );

      if (level === LOG_LEVEL.ERROR) {
        process.stderr.write(`${JSON.stringify(structured)}\n`);
      } else {
        process.stdout.write(`${JSON.stringify(structured)}\n`);
      }
    }
  }

  private getStructuredLog(
    level: LOG_LEVEL,
    message: any,
    ...optionalParams: any[]
  ): StructuredLog {
    const { messages, context } = this.getContextAndMessagesToPrint([
      message,
      ...optionalParams,
    ]);

    const formattedMessage = messages
      .map((m) => {
        return util.format(m);
      })
      .join(' ');

    return {
      level,
      message: formattedMessage,
      timestamp: Date.now(),
      context: context ?? 'unknown',
      traceId: this.cls?.getId(),
    };
  }

  protected getTimestamp(): string {
    return dateTimeFormatter.format(Date.now());
  }

  protected printMessages(
    messages: unknown[],
    context = '',
    logLevel: LOG_LEVEL,
    writeStreamType?: 'stdout' | 'stderr',
  ) {
    messages.forEach((message) => {
      const contextMessage = this.formatContext(context);
      const formattedLogLevel = logLevel.toUpperCase().padEnd(7, ' ');
      const formattedMessage = this.formatMessage(
        logLevel,
        message,
        formattedLogLevel,
        contextMessage,
      );

      process[writeStreamType ?? 'stdout'].write(formattedMessage);
    });
  }

  protected formatContext(context: string): string {
    return context ? yellow(`[${context}] `) : '';
  }

  protected formatMessage(
    logLevel: LOG_LEVEL,
    message: unknown,
    formattedLogLevel: string,
    contextMessage: string,
  ) {
    const output = this.stringifyMessage(message, logLevel);
    formattedLogLevel = this.colorize(formattedLogLevel, logLevel);
    return `${this.getTimestamp()} ${formattedLogLevel} ${contextMessage}${output}\n`;
  }

  protected stringifyMessage(message: unknown, logLevel: LOG_LEVEL): any {
    if (isFunction(message)) {
      const messageAsStr = Function.prototype.toString.call(message);
      const isClass = messageAsStr.startsWith('class ');
      if (isClass) {
        // If the message is a class, we will display the class name.
        return this.stringifyMessage(message.name, logLevel);
      }
      // If the message is a non-class function, call it and re-resolve its value.
      return this.stringifyMessage(message(), logLevel);
    }

    return isPlainObject(message) || Array.isArray(message)
      ? `${this.colorize('Object:', logLevel)}\n${JSON.stringify(
          message,
          (key, value) =>
            typeof value === 'bigint' ? value.toString() : value,
          2,
        )}\n`
      : this.colorize(message as string, logLevel);
  }

  protected colorize(message: string, logLevel: LOG_LEVEL) {
    const color = this.getColorByLogLevel(logLevel);
    return color(message);
  }

  protected printStackTrace(stack: string) {
    if (!stack) {
      return;
    }
    process.stderr.write(`${stack}\n`);
  }

  private getContextAndMessagesToPrint(args: unknown[]) {
    if (args?.length <= 1) {
      return { messages: args };
    }
    const lastElement = args[args.length - 1];
    const isContext = isString(lastElement);
    if (!isContext) {
      return { messages: args };
    }
    return {
      context: lastElement as string,
      messages: args.slice(0, args.length - 1),
    };
  }

  private getContextAndStackAndMessagesToPrint(args: unknown[]) {
    if (args.length === 2) {
      return this.isStackFormat(args[1])
        ? {
            messages: [args[0]],
            stack: args[1] as string,
          }
        : {
            messages: [args[0]],
            context: args[1] as string,
          };
    }

    const { messages, context } = this.getContextAndMessagesToPrint(args);
    if (messages?.length <= 1) {
      return { messages, context };
    }
    const lastElement = messages[messages.length - 1];
    const isStack = isString(lastElement);
    // https://github.com/nestjs/nest/issues/11074#issuecomment-1421680060
    if (!isStack && !isUndefined(lastElement)) {
      return { messages, context };
    }
    return {
      stack: lastElement as string,
      messages: messages.slice(0, messages.length - 1),
      context,
    };
  }

  private isStackFormat(stack: unknown) {
    if (!isString(stack) && !isUndefined(stack)) {
      return false;
    }

    return /^(.)+\n\s+at .+:\d+:\d+/.test(stack!);
  }

  private getColorByLogLevel(level: LOG_LEVEL) {
    switch (level) {
      case LOG_LEVEL.DEBUG:
        return clc.magentaBright;
      case LOG_LEVEL.WARN:
        return clc.yellow;
      case LOG_LEVEL.ERROR:
        return clc.red;
      case LOG_LEVEL.VERBOSE:
        return clc.cyanBright;
      case LOG_LEVEL.FATAL:
        return clc.bold;
      default:
        return clc.green;
    }
  }
}
