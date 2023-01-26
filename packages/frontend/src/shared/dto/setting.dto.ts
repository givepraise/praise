import { SettingGroup } from 'shared/enums/setting-group.enum';

export interface SettingDto {
  _id: string;
  key: string;
  label: string;
  description?: string;
  defaultValue?: string;
  value?: string;
  valueRealized?: string | boolean | number | number[] | string[] | object;
  type: string;
  options?: string;
  group: SettingGroup;
  subgroup: number;
}
