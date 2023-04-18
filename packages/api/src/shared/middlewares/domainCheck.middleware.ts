import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiException } from '../exceptions/api-exception';
import { errorMessages } from '../exceptions/error-messages';
import { MongoClient } from 'mongodb';
import { MONGODB_MAIN_DB } from '../../constants/constants.provider';
import { logger } from '../logger';

@Injectable()
export class DomainCheckMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: () => void) {
    if (req.baseUrl === '/api/domain-check') {
      const domain = req.query.domain;
      if (!domain) {
        res.status(404).send('Domain not found');
      }

      if (!process.env.MONGO_ADMIN_URI) {
        throw new ApiException(errorMessages.MONGO_ADMIN_URI_NOT_SET);
      }

      logger.info(`[GET] /api/domain-check?domain=${domain}`);

      const mongodb = new MongoClient(process.env.MONGO_ADMIN_URI);
      try {
        await mongodb.connect();
        const db = mongodb.db(MONGODB_MAIN_DB);
        const communitites = db.collection('communities');
        const domainFound = await communitites.findOne({
          hostname: domain,
        });
        if (domainFound) {
          logger.debug(`Found domain ${domain}`);
          res.status(200).send('OK');
        }
      } catch (error) {
        throw new ApiException(errorMessages.FAILED_TO_QUERY_COMMUNITIES);
      } finally {
        await mongodb.close();
      }
    }
    next();
  }
}
