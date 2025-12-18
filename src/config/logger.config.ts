import { LogLevel } from '@nestjs/common';
import { appConfig } from './app.config';

export const loggerConfig = {
  levels: appConfig.isProduction
    ? (['error', 'warn', 'log'] as LogLevel[])
    : (['error', 'warn', 'log', 'debug', 'verbose'] as LogLevel[]),
};
