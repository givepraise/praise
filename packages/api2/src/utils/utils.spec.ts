import { ConstantsProvider } from '@/constants/constants.provider';
import { Test, TestingModule } from '@nestjs/testing';
import { UtilsProvider } from './utils.provider';

describe('Utils', () => {
  let provider: UtilsProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UtilsProvider, ConstantsProvider],
    }).compile();

    provider = module.get<UtilsProvider>(UtilsProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
