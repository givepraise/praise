import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { ServiceException } from '@/shared/exceptions/service-exception';

@Catch(ServiceException)
export class ServiceExceptionFilter implements ExceptionFilter {
  catch(exception: ServiceException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = 400; // Bad Request

    response.status(status).json({
      statusCode: status, // Bad Request
      message: exception.message,
      error: 'Bad Request',
    });
  }
}
