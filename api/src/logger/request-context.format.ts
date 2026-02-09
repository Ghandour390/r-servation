import * as winston from 'winston';
import { getLogContext } from './request-context';

export const addRequestContext = winston.format((info) => {
  const context = getLogContext();
  if (!context) return info;

  info.requestId ??= context.requestId;
  if (context.userId) info.userId ??= context.userId;
  if (context.userEmail) info.userEmail ??= context.userEmail;
  if (context.ip) info.ip ??= context.ip;

  return info;
});

