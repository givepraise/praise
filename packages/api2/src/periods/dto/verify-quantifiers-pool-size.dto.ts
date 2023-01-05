import { ApiProperty } from '@nestjs/swagger';

export class VerifyQuantifierPoolSizeDto {
  @ApiProperty({
    description: 'The number of quantifiers in the pool',
    example: 10,
  })
  quantifierPoolSize: number;
  @ApiProperty({
    description: 'The number of quantifiers needed in the pool',
    example: 10,
  })
  quantifierPoolSizeNeeded: number;
  @ApiProperty({
    description: '',
    example: 0,
  })
  quantifierPoolDeficitSize: number;
}
