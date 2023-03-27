import { ApiProperty } from '@nestjs/swagger';

export class VerifyQuantifierPoolSizeDto {
  @ApiProperty({
    description: 'The number of quantifiers in the pool',
    type: 'number',
    example: 10,
  })
  quantifierPoolSize: number;
  @ApiProperty({
    description: 'The number of quantifiers needed in the pool',
    type: 'number',
    example: 10,
  })
  quantifierPoolSizeNeeded: number;
  @ApiProperty({
    description: '',
    type: 'number',
    example: 0,
  })
  quantifierPoolDeficitSize: number;
}
