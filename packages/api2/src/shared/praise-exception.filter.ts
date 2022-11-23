import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { PraiseException } from './praise.exception';

@Catch(PraiseException)
export class PraiseExceptionFilter implements ExceptionFilter {
  catch(exception: PraiseException, host: ArgumentsHost) {
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
