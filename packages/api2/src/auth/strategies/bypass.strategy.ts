import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-custom';
import { SettingsService } from '@/settings/settings.service';
import { AuthContext } from '../auth-context';
import { AuthRole } from '../enums/auth-role.enum';

@Injectable()
/**
 * Passport strategy that bypasses authentication for routes configured in the
 * BYPASS_ROUTE_AUTH setting.
 */
export class BypassStrategy extends PassportStrategy(Strategy, 'bypass') {
  constructor(private readonly settingsService: SettingsService) {
    super();
  }
  async validate(req: Request): Promise<AuthContext | null> {
    const bypassRoutesSetting = await this.settingsService.findOneByKey(
      'BYPASS_ROUTE_AUTH',
    );

    // No bypass routes configured means no bypass
    if (!bypassRoutesSetting) {
      return null;
    }

    // Check if the current route is in the bypass list
    const bypassRoutesList = bypassRoutesSetting.value.split(',');
    for (const route of bypassRoutesList) {
      if (req.url.startsWith(route)) {
        // If so, return a dummy user with the USER role
        return { roles: [AuthRole.USER] };
      }
    }
    return null;
  }
}
