import { ApiResponseProperty } from '@nestjs/swagger';
import { User } from '../../users/schemas/users.schema';

export class LoginResponseDto {
  @ApiResponseProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MmIwNmY3NjU1ODA0YjE2MjllODQxNTkiLCJpZGVudGl0eUV0aEFkZHJlc3MiOiIweGEzMmFFQ2RhNzUyY0Y0RUY4OTk1NmU4M2Q2MEMwNDgzNWQ0RkE4NjciLCJyb2xlcyI6WyJVU0VSIiwiQURNSU4iXSwiaXNSZWZyZXNoIjpmYWxzZSwiaWF0IjoxNjcwMzE1OTk4LCJleHAiOjE2NzAzMTk1OTh9.qKvucMZLVbz_1TnsxaSqYX1i5CSpver6fFJTf3pABVA',
    type: 'string',
  })
  accessToken: string;

  @ApiResponseProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MmIwNmY3NjU1ODA0YjE2MjllODQxNTkiLCJpZGVudGl0eUV0aEFkZHJlc3MiOiIweGEzMmFFQ2RhNzUyY0Y0RUY4OTk1NmU4M2Q2MEMwNDgzNWQ0RkE4NjciLCJyb2xlcyI6WyJVU0VSIiwiQURNSU4iXSwiaXNSZWZyZXNoIjpmYWxzZSwiaWF0IjoxNjcwMzE1OTk4LCJleHAiOjE2NzAzMTk1OTh9.qKvucMZLVbz_1TnsxaSqYX1i5CSpver6fFJTf3pABVA',
    type: 'string',
  })
  refreshToken: string;

  @ApiResponseProperty({
    example: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    type: 'string',
  })
  identityEthAddress: string;

  @ApiResponseProperty({
    example: 'bearer',
    type: 'string',
  })
  tokenType: string;

  @ApiResponseProperty({
    type: User,
  })
  user: User;
}
