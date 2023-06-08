import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateTokenDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MmIwNmY3NjU1ODA0YjE2MjllODQxNTkiLCJpZGVudGl0eUV0aEFkZHJlc3MiOiIweGEzMmFFQ2RhNzUyY0Y0RUY4OTk1NmU4M2Q2MEMwNDgzNWQ0RkE4NjciLCJyb2xlcyI6WyJVU0VSIiwiQURNSU4iXSwiaXNSZWZyZXNoIjpmYWxzZSwiaWF0IjoxNjcwMzE1OTk4LCJleHAiOjE2NzAzMTk1OTh9.qKvucMZLVbz_1TnsxaSqYX1i5CSpver6fFJTf3pABVA',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
