import Strategy from 'passport-unique-token';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ApiKeyService } from '@/api-key/api-key.service';
import { AuthContext } from '../auth-context';
import { ConstantsProvider } from '@/constants/constants.provider';
import { AuthRole } from '../enums/auth-role.enum';

@Injectable()
/**
 * Passport strategy for authenticating users using api key.
 */
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly constantsProvider: ConstantsProvider,
  ) {
    super({
      tokenHeader: 'x-api-key',
    });
  }

  async validate(apiKey: any): Promise<AuthContext | null> {
    // Check if the API key has been configured in the environment variables.
    const index = this.constantsProvider.apiKeys.indexOf(apiKey);
    if (index >= -1) {
      const key = this.constantsProvider.apiKeys[index];
      const role = this.constantsProvider.apiKeyRoles[index];
      return {
        roles: [AuthRole[role as keyof typeof AuthRole]],
        apiKey: key,
      };
    }

    // Check if the API key has been configured in the database.
    const key = await this.apiKeyService.findOneByKey(apiKey);
    if (key) {
      return {
        roles: [key.role],
        apiKey: key.hash,
        apiKeyId: key._id,
      };
    }
    return null;
  }
}
