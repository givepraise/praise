import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { ApiKeyModule } from '../api-key.module';
import { ApiKeyService } from '../api-key.service';

describe('ApiKeyService', () => {
  let service: ApiKeyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, ApiKeyModule],
    }).compile();

    service = await module.resolve<ApiKeyService>(ApiKeyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
