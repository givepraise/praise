import { PickType } from '@nestjs/swagger';
import { ApiKey } from '../schemas/api-key.schema';

export class CreateApiKeyRequest extends PickType(ApiKey, [
  'description',
  'role',
] as const) {}
