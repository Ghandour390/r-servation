import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, originalUrl, body, query, params } = request;
    const userAgent = request.get('user-agent') || '';
    const ip = request.ip || request.connection?.remoteAddress;
    const user = (request as any).user;

    const now = Date.now();
    const timestamp = new Date().toISOString();

    // Log request start
    this.logger.log(
      `📥 [${timestamp}] ${method} ${originalUrl} - IP: ${ip} - User: ${user?.email || 'Anonymous'}`,
    );

    // Log request body if exists (for POST, PUT, PATCH)
    if (['POST', 'PUT', 'PATCH'].includes(method) && Object.keys(body || {}).length > 0) {
      // Hide sensitive data
      const sanitizedBody = this.sanitizeBody(body);
      this.logger.debug(`📦 Body: ${JSON.stringify(sanitizedBody)}`);
    }

    // Log query params if exists
    if (Object.keys(query || {}).length > 0) {
      this.logger.debug(`🔍 Query: ${JSON.stringify(query)}`);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - now;
          const statusCode = response.statusCode;
          
          // Color based on status code
          const statusEmoji = this.getStatusEmoji(statusCode);
          
          this.logger.log(
            `${statusEmoji} [${timestamp}] ${method} ${originalUrl} - ${statusCode} - ⏱️ ${duration}ms`,
          );

          // Log response summary for debugging (optional)
          if (process.env.LOG_RESPONSE === 'true' && data) {
            const responseSummary = this.getResponseSummary(data);
            this.logger.debug(`📤 Response: ${responseSummary}`);
          }
        },
        error: (error) => {
          const duration = Date.now() - now;
          const statusCode = error.status || 500;
          
          this.logger.error(
            `❌ [${timestamp}] ${method} ${originalUrl} - ${statusCode} - ⏱️ ${duration}ms - Error: ${error.message}`,
          );
        },
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

  private getStatusEmoji(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) return '✅';
    if (statusCode >= 300 && statusCode < 400) return '↪️';
    if (statusCode >= 400 && statusCode < 500) return '⚠️';
    return '🔥';
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
