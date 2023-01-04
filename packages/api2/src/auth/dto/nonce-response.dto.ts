import { ApiResponseProperty } from '@nestjs/swagger';
export class NonceResponseDto {
  @ApiResponseProperty({
    example: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  })
  identityEthAddress: string;

  @ApiResponseProperty({
    example: 'uh9h998u98uj09noj',
  })
  nonce: string;
}
