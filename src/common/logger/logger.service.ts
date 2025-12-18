import { Logger, LogLevel } from '@nestjs/common';

export class LoggerService {
  private static instance: LoggerService;
  private loggers: Map<string, Logger> = new Map();
  private readonly defaultContext = 'Application';

  private constructor() {}

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  getLogger(context: string): Logger {
    if (!this.loggers.has(context)) {
      this.loggers.set(context, new Logger(context));
    }
    return this.loggers.get(context)!;
  }

  log(message: string, context?: string): void {
    const logger = this.getLogger(context || this.defaultContext);
    logger.log(message);
  }

  error(message: string, trace?: string, context?: string): void {
    const logger = this.getLogger(context || this.defaultContext);
    logger.error(message, trace);
  }

  warn(message: string, context?: string): void {
    const logger = this.getLogger(context || this.defaultContext);
    logger.warn(message);
  }

  debug(message: string, context?: string): void {
    const logger = this.getLogger(context || this.defaultContext);
    logger.debug(message);
  }

  verbose(message: string, context?: string): void {
    const logger = this.getLogger(context || this.defaultContext);
    logger.verbose(message);
  }

  setLogLevels(levels: LogLevel[]): void {
    Logger.overrideLogger(levels);
  }
}

export const logger = LoggerService.getInstance();
