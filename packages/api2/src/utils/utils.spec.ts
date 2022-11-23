import { Test, TestingModule } from '@nestjs/testing';
import { UtilsProvider } from './utils.provider';

describe('Utils', () => {
  let provider: UtilsProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UtilsProvider],
    }).compile();

    provider = module.get<UtilsProvider>(UtilsProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
