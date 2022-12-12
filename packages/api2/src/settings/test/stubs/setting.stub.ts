import { Types } from 'mongoose';
import { SettingGroup } from '@/settings/interfaces/settings-group.interface';
import { Setting } from '@/settings/schemas/settings.schema';

export const settingStub: Setting = {
  _id: new Types.ObjectId('5f9f1c1b9b9b9b9b9b9b9b9b'),
  key: 'TestKey',
  value: 'Test Value',
  valueRealized: 'Test Value',
  defaultValue: '',
  type: 'String',
  label: 'Test Label',
  description: 'Test Description',
  group: SettingGroup.APPLICATION,
  options: '',
  subgroup: 1,
};
