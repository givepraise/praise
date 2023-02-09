import { PeriodsService } from '@/periods/services/periods.service';
import { PeriodSettingsService } from '@/periodsettings/periodsettings.service';
import { PraiseService } from '@/praise/services/praise.service';
import { QuantificationsService } from '@/quantifications/services/quantifications.service';
import { SettingsService } from '@/settings/settings.service';
import { UsersService } from '@/users/users.service';
import { UtilsProvider } from '@/utils/utils.provider';

export interface MigrationsContext {
  context: {
    praiseService: PraiseService;
    usersService: UsersService;
    periodService: PeriodsService;
    settingsService: SettingsService;
    periodSettingsService: PeriodSettingsService;
    quantificationsService: QuantificationsService;
    utilsProvider: UtilsProvider;
  };
}
