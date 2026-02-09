import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { addRequestContext } from './request-context.format';

function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

const logsDir = path.resolve(process.env.LOG_DIR || 'logs');
ensureDir(logsDir);

const baseFormat = winston.format.combine(
  addRequestContext(),
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
);

const jsonFormat = winston.format.combine(baseFormat, winston.format.json());

const prettyConsoleFormat = winston.format.combine(
  baseFormat,
  winston.format.colorize(),
  winston.format.printf((info) => {
    const { timestamp, level, message, context, ...meta } = info as any;
    const metaString = Object.keys(meta || {}).length ? ` ${JSON.stringify(meta)}` : '';
    const msg = typeof message === 'string' ? message : JSON.stringify(message);
    return `[${timestamp}] ${level} ${context ?? ''} ${msg}${metaString}`.trim();
  }),
);

export const winstonLogger = WinstonModule.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  transports: [
    new winston.transports.Console({
      format: process.env.LOG_PRETTY === 'true' ? prettyConsoleFormat : jsonFormat,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: jsonFormat,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      level: 'info',
      format: jsonFormat,
    }),
  ],
});

