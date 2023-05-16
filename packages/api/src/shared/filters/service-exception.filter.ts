import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { ApiException } from '../exceptions/api-exception';

@Catch(ApiException)
export class ServiceExceptionFilter implements ExceptionFilter {
  catch(exception: ApiException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.httpsStatusCode || 400; // Bad Request

    // Save exception response object for logging purposes
    (response as any).exception = exception;

    response.status(status).json({
      statusCode: status,
      message: exception?.description || exception.message,
      code: exception.code,
      error: 'Bad Request',
    });
  }
}
