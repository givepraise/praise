import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-custom';
import { SettingsService } from '@/settings/settings.service';

@Injectable()
/**
 * Passport strategy that bypasses authentication for routesconfigured in the
 * BYPASS_ROUTE_AUTH setting.
 */
export class BypassStrategy extends PassportStrategy(Strategy, 'bypass') {
  constructor(private readonly settingsService: SettingsService) {
    super();
  }
  async validate(req: Request): Promise<any> {
    const bypassRoutesSetting = await this.settingsService.findOneByKey(
      'BYPASS_ROUTE_AUTH',
    );

    // No bypass routes configured means no bypass
    if (!bypassRoutesSetting) {
      return null;
    }

    // Check if the current route is in the bypass list
    const bypassRoutesList = bypassRoutesSetting.valueRealized as string[];
    if (bypassRoutesList.includes(req.url)) {
      // If so, return a dummy user with the USER role
      return { roles: ['USER'] };
    }
    return null;
  }
}
