import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { MongoServerError } from 'mongoose/node_modules/mongodb';

@Catch(MongoServerError)
export class MongoServerErrorFilter implements ExceptionFilter {
  catch(exception: MongoServerError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception.code === 11000) {
      return response.status(409).json({
        statusCode: 409,
        error: 'Duplicate key',
        message: `${Object.keys(exception.keyValue)[0]} '${
          Object.values(exception.keyValue)[0]
        } 'already exists.`,
      });
    }

    console.error(exception);

    return response.status(500).json({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Internal Server Error',
    });
  }
}
