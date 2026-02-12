import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, defer } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { runWithLogContext } from '../../logger/request-context';
import { winstonLogger } from '../../logger/winston.config';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = winstonLogger;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, originalUrl, body, query, params } = request;
    const userAgent = request.get('user-agent') || '';
    const ip =
      ((request.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
        request.ip ||
        (request.connection as any)?.remoteAddress) ??
      '';

    const user = (request as any).user;
    const userId = user?.id != null ? String(user.id) : undefined;

    const requestIdHeader = request.headers['x-request-id'];
    const requestId =
      (typeof requestIdHeader === 'string' && requestIdHeader.trim()) ||
      (Array.isArray(requestIdHeader) && requestIdHeader[0]) ||
      randomUUID();

    (request as any).requestId = requestId;
    response.setHeader('x-request-id', requestId);

    const startedAt = Date.now();

    return defer(() =>
      runWithLogContext({ requestId, userId, userEmail: user?.email, ip }, () => {
        this.logger.log(
          {
            message: 'http.request',
            phase: 'start',
            method,
            url: originalUrl,
            ip,
            userAgent,
            ...(userId ? { userId } : {}),
            ...(user?.email ? { userEmail: user.email } : {}),
            params,
          },
          'HTTP',
        );

        if (['POST', 'PUT', 'PATCH'].includes(method) && Object.keys(body || {}).length > 0) {
          const sanitizedBody = this.sanitizeBody(body);
          this.logger.debug({ message: 'http.body', body: sanitizedBody }, 'HTTP');
        }

        if (Object.keys(query || {}).length > 0) {
          this.logger.debug({ message: 'http.query', query }, 'HTTP');
        }

        return next.handle().pipe(
          tap({
            next: (data) => {
              const durationMs = Date.now() - startedAt;
              const statusCode = response.statusCode;

              this.logger.log(
                {
                  message: 'http.request',
                  phase: 'end',
                  method,
                  url: originalUrl,
                  statusCode,
                  durationMs,
                },
                'HTTP',
              );

              if (process.env.LOG_RESPONSE === 'true' && data) {
                const summary = this.getResponseSummary(data);
                this.logger.debug({ message: 'http.response', summary }, 'HTTP');
              }
            },
            error: (error) => {
              const durationMs = Date.now() - startedAt;
              const statusCode = error?.status || 500;

              this.logger.error(
                {
                  message: 'http.request',
                  phase: 'error',
                  method,
                  url: originalUrl,
                  statusCode,
                  durationMs,
                  errorMessage: error?.message ?? 'Unknown error',
                },
                error?.stack,
                'HTTP',
              );
            },
          }),
        );
      }),
    );
  }

  private sanitizeBody(body: any): any {
    const sensitiveFields = ['password', 'token', 'secret', 'authorization', 'creditCard'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***HIDDEN***';
      }
    }

    return sanitized;
  }

  private getResponseSummary(data: any): string {
    if (Array.isArray(data)) {
      return `Array[${data.length}]`;
    }
    if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data);
      return `Object{${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}}`;
    }
    return String(data).substring(0, 100);
  }
}
