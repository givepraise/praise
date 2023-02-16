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
    const bypassRoutesSettingValue = (await this.settingsService.settingValue(
      'BYPASS_ROUTE_AUTH',
    )) as string;

    // No bypass routes configured means no bypass
    if (!bypassRoutesSettingValue) {
      return null;
    }

    // Check if the current route is in the bypass list
    const bypassRoutesList = bypassRoutesSettingValue.split(',');
    if (bypassRoutesList.includes(req.url)) {
      // If so, return a dummy user with the USER role
      return { roles: ['USER'] };
    }
    return null;
  }
}
