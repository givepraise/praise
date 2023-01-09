import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { PeriodSettingsService } from '../../periodsettings/periodsettings.service';
import { PeriodSetting } from '@/periodsettings/schemas/periodsettings.schema';
import { SettingGroup } from '@/settings/interfaces/settings-group.interface';

@Injectable()
export class PeriodSettingsSeeder {
  constructor(private readonly periodSettingsService: PeriodSettingsService) {}

  /**
   * Generate and save a fake PeriodSettings
   *
   * @param {Object} [PeriodSettingsData={}]
   * @returns {Promise<PeriodSettings>}
   */
  seedPeriodSettings = async (
    PeriodSettingsData: Record<string, unknown> = {},
  ): Promise<PeriodSetting> => {
    const PeriodSetting = await this.periodSettingsService.getModel().create({
      period: PeriodSettingsData.period || null,
      setting: PeriodSettingsData.setting || null,
      value: PeriodSettingsData.value || faker.random.word(),
    });

    return PeriodSetting;
  };
}
