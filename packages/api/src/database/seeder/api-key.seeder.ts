import { ApiKeyService } from '../../api-key/api-key.service';
import { CreateApiKeyResponseDto } from '../../api-key/dto/create-api-key-response';
import { AuthRole } from '../../auth/enums/auth-role.enum';
import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiKeySeeder {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  /**
   * Generate and save a fake ApiKey
   */
  seedApiKey = async (): Promise<CreateApiKeyResponseDto> => {
    const apiKey = await this.apiKeyService.createApiKey({
      description: faker.lorem.lines(1),
      role: AuthRole.API_KEY_READWRITE,
    });
    return apiKey;
  };
}
