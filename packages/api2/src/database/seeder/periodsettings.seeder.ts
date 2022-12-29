import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { PeriodSettingsService } from '../../periodsettings/periodsettings.service';
import { PeriodSetting } from '@/periodsettings/schemas/periodsettings.schema';
import { SettingGroup } from '@/settings/interfaces/settings-group.interface';

@Injectable()
export class PeriodSettingsSeeder {
  PeriodSettingsModel = this.PeriodSettingsService.getModel();
  constructor(private readonly PeriodSettingsService: PeriodSettingsService) {}

  /**
   * Generate and save a fake PeriodSettings
   *
   * @param {Object} [PeriodSettingsData={}]
   * @returns {Promise<PeriodSettings>}
   */
  seedPeriodSettings = async (
    PeriodSettingsData: Record<string, unknown> = {},
  ): Promise<PeriodSetting> => {
    const PeriodSetting = await this.PeriodSettingsModel.create({
      period: PeriodSettingsData.period || null,
      key: PeriodSettingsData.key || faker.random.word(),
      value: PeriodSettingsData.value || faker.random.word(),
      type: PeriodSettingsData.type || faker.random.word(),
      label: PeriodSettingsData.label || faker.random.word(),
      description: PeriodSettingsData.description || faker.random.word(),
      group: PeriodSettingsData.group || SettingGroup.PERIOD_DEFAULT,
      subgroup: PeriodSettingsData.subgroup || faker.random.numeric(),
      ...PeriodSettingsData,
    });

    return PeriodSetting;
  };
}
