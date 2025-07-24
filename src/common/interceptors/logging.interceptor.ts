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
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    // Log da requisição
    this.logger.log(
      `${method} ${url} - ${ip} - ${userAgent}`,
      'Request',
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          // Log da resposta
          this.logger.log(
            `${method} ${url} - ${response.statusCode} - ${duration}ms`,
            'Response',
          );
        },
        error: (error) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          // Log do erro
          this.logger.error(
            `${method} ${url} - ${response.statusCode} - ${duration}ms - ${error.message}`,
            error.stack,
            'Error',
          );
        },
      }),
    );
  }
} 