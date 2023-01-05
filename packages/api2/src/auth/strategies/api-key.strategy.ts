import Strategy from 'passport-unique-token';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ApiKeyService } from '@/api-key/api-key.service';
import { AuthContext } from '../auth-context';

@Injectable()
/**
 * Passport strategy for authenticating users using api key.
 */
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  constructor(private readonly apiKeyService: ApiKeyService) {
    super({
      tokenHeader: 'x-api-key',
    });
  }

  async validate(apiKey: any): Promise<AuthContext | null> {
    const key = await this.apiKeyService.findOneByKey(apiKey);
    if (key) {
      return {
        roles: [key.role],
        apiKeyId: key._id,
      };
    }
    return null;
  }
}
