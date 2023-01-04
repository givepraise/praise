import { ApiResponseProperty } from '@nestjs/swagger';
import { ApiKey } from '../schemas/api-key.schema';

export class CreateApiKeyResponseDto extends ApiKey {
  @ApiResponseProperty({
    example: '1834a97caed67b244dd11fa5ef53aa74f13781ad0aea8148b8607d861d9f7535',
  })
  key: string;
}
