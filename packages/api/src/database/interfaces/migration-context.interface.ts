import { PeriodsService } from '../../periods/services/periods.service';
import { PraiseService } from '../../praise/services/praise.service';
import { QuantificationsService } from '../../quantifications/services/quantifications.service';
import { SettingsService } from '../../settings/settings.service';
import { UsersService } from '../../users/users.service';

export interface MigrationsContext {
  context: {
    praiseService: PraiseService;
    usersService: UsersService;
    periodService: PeriodsService;
    settingsService: SettingsService;
    quantificationsService: QuantificationsService;
  };
}
