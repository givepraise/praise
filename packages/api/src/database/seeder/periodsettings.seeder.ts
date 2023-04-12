import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { PeriodSetting } from '../../settings/schemas/periodsettings.schema';
import { SettingsService } from '../../settings/settings.service';

@Injectable()
export class PeriodSettingsSeeder {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Generate and save a fake PeriodSettings
   *
   * @param {Object} [PeriodSettingsData={}]
   * @returns {Promise<PeriodSettings>}
   */
  seedPeriodSettings = async (
    PeriodSettingsData: Record<string, unknown> = {},
  ): Promise<PeriodSetting> => {
    const PeriodSetting = await this.settingsService
      .getPeriodSettingsModel()
      .create({
        period: PeriodSettingsData.period || null,
        setting: PeriodSettingsData.setting || null,
        value: PeriodSettingsData.value || faker.random.word(),
      });

    return PeriodSetting;
  };
}
