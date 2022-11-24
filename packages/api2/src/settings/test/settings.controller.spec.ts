import { Test, TestingModule } from '@nestjs/testing';
import { SettingsController } from '../settings.controller';
import { SettingsService } from '../settings.service';
import { settingStub } from './stubs/setting.stub';

jest.mock('@/settings/settings.service');

describe('SettingsController', () => {
  let settingsController: SettingsController;
  let settingsService: SettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [SettingsController],
      providers: [SettingsService],
    }).compile();

    settingsController = module.get<SettingsController>(SettingsController);
    settingsService = module.get<SettingsService>(SettingsService);
    jest.clearAllMocks();
  });

  describe('GET /api/settings/all', () => {
    beforeEach(async () => {
      jest.clearAllMocks();
    });

    test('200 response with json body containing list of settings', async () => {
      const response = await settingsController.findAll();
      expect(Object.keys(response[0])).toEqual(Object.keys(settingStub));
    });
  });

  describe('GET /api/settings/:id', () => {
    it('200 response with json body containing a setting', async function () {
      const response = await settingsController.findOne(settingStub._id);
      expect(response._id).toEqual(settingStub._id);
    });
  });
});
