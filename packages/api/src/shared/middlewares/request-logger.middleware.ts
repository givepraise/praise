import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';

function debugLogException(res: Response) {
  const exception = (res as any).exception;
  if (!exception) return;
  const errorJson = JSON.stringify({
    ...exception,
    message: exception.message,
  });
  logger.debug(`Exception: ${errorJson}`);
}

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Log request body and query params
    if (process.env.LOGGER_LEVEL === 'debug') {
      logger.debug(`Request headers: ${JSON.stringify(req.headers)}`);
      Object.keys(req.body).length > 0 &&
        logger.debug(`Request body: ${JSON.stringify(req.body)}`);
      Object.keys(req.query).length > 0 &&
        logger.debug(`Request query: ${JSON.stringify(req.query)}`);
    }

    // Log response status code and message
    res.on('finish', () => {
      const statusCode = res.statusCode;
      if (statusCode >= 400 && statusCode < 500) {
        logger.warn(`[${req.method}] ${req.url} - ${statusCode}`);
        debugLogException(res);
      } else if (statusCode >= 500) {
        logger.error(`[${req.method}] ${req.url} - ${statusCode}`);
        debugLogException(res);
      } else {
        logger.info(`[${req.method}] ${req.url} - ${statusCode}`);
      }
    });

    next();
  }
}
