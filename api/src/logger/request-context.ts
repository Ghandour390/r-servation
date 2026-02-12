import { AsyncLocalStorage } from 'node:async_hooks';

export type LogContext = {
  requestId: string;
  userId?: string;
  userEmail?: string;
  ip?: string;
};

const storage = new AsyncLocalStorage<LogContext>();

export function runWithLogContext<T>(context: LogContext, fn: () => T): T {
  return storage.run(context, fn);
}

export function getLogContext(): LogContext | undefined {
  return storage.getStore();
}

export function updateLogContext(partial: Partial<LogContext>): void {
  const current = storage.getStore();
  if (!current) return;
  Object.assign(current, partial);
}

