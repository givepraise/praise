import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { ApiKeyController } from '../api-key.controller';
import { ApiKeyModule } from '../api-key.module';

describe('ApiKeyController', () => {
  let controller: ApiKeyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, ApiKeyModule],
    }).compile();

    controller = await module.resolve<ApiKeyController>(ApiKeyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
