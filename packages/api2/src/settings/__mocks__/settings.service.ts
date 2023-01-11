import { settingStub } from '../test/stubs/setting.stub';

export const SettingsService = jest.fn().mockReturnValue({
  findAll: jest.fn().mockResolvedValue([settingStub]),
  findOneById: jest.fn().mockResolvedValue(settingStub),
  setOne: jest.fn().mockResolvedValue(settingStub),
});
