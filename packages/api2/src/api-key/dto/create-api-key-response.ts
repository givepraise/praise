import { ApiResponseProperty } from '@nestjs/swagger';
import { ApiKey } from '../schemas/api-key.schema';

export class CreateApiKeyResponse extends ApiKey {
  @ApiResponseProperty({
    example: '0x8a32aECda752cF4FE89956e83d60C04835d4FA867',
  })
  key: string;
}
