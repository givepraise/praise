import { PickType } from '@nestjs/swagger';
import { ApiKey } from '../schemas/api-key.schema';

export class CreateApiKeyInputDto extends PickType(ApiKey, [
  'description',
  'role',
] as const) {}
