import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { logger } from '../logger';

@Injectable()
export class PingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    if (req.originalUrl === '/api/ping') {
      logger.info('[GET] /api/ping');
      res.status(200).send('PONG');
    } else {
      next();
    }
  }
}
