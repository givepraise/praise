import { PickType } from '@nestjs/swagger';
import { ApiKey } from '../schemas/api-key.schema';

export class UpdateDescriptionInputDto extends PickType(ApiKey, [
  'description',
] as const) {}
