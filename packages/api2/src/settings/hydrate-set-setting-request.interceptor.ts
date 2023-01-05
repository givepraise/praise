import { CallHandler, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { SettingsService } from './settings.service';
import { Types } from 'mongoose';

/**
 * Fetches the setting from the database and merges it with the request body.
 * This hydrating of the request body is necessary so that the validation can
 * be performed on the entire setting object.
 */
@Injectable()
export class HydrateSetSettingRequestInterceptor {
  constructor(private readonly settingsService: SettingsService) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const req: Request = context.switchToHttp().getRequest();

    const setting = await this.settingsService.findOneById(
      new Types.ObjectId(req.params.id),
    );
    const value = req.body.value;

    req.body = {
      ...setting,
      value,
    };

    return next.handle();
  }
}
