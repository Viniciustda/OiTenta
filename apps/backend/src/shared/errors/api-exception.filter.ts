import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  DomainError,
  ValidationError,
  ValidationException,
} from '@oitenta/shared';
import { Request, Response } from 'express';

export interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  details?: unknown;
  path: string;
  timestamp: string;
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<Request>();
    const body = this.toBody(exception, request.url);
    response.status(body.statusCode).json(body);
  }

  private toBody(exception: unknown, path: string): ApiErrorResponse {
    const base = { path, timestamp: new Date().toISOString() };

    if (exception instanceof ValidationException) {
      return {
        ...base,
        statusCode: exception.statusCode,
        error: 'ValidationException',
        message: 'Dados inválidos.',
        details: exception.errors.map((error) => error.message),
      };
    }

    if (
      exception instanceof ValidationError ||
      exception instanceof DomainError
    ) {
      return {
        ...base,
        statusCode: exception.statusCode,
        error: exception.name,
        message: exception.message,
      };
    }

    if (exception instanceof HttpException) {
      const payload = exception.getResponse();
      const raw =
        typeof payload === 'string'
          ? payload
          : (payload as { message?: unknown }).message;
      const message = Array.isArray(raw)
        ? raw.join(' ')
        : typeof raw === 'string'
          ? raw
          : exception.message;
      return {
        ...base,
        statusCode: exception.getStatus(),
        error: exception.name,
        message,
      };
    }

    this.logger.error('Erro inesperado', exception as Error);
    return {
      ...base,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'InternalServerError',
      message: 'Erro interno.',
    };
  }
}
