import { PeriodsService } from '@/periods/periods.service';
import { PeriodSettingsService } from '@/periodsettings/periodsettings.service';
import { PraiseService } from '@/praise/praise.service';
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
    utilsProvider: UtilsProvider;
  };
}
