import { SettingGroup } from '../enums/setting-group.enum';

export interface SettingDto {
  _id: string;
  key: string;
  label: string;
  description?: string;
  defaultValue?: string;
  value?: string;
  valueRealized?: string | string[] | boolean | number | number[] | undefined;
  type: string;
  options?: string;
  group: SettingGroup;
  subgroup: number;
}
