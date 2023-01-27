import { ApiResponseProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Praise } from '../schemas/praise.schema';
import { PaginatedResponseDto } from '@/shared/dto/paginated-response.dto';
import { UserAccountWithUserRefDto } from '@/useraccounts/dto/useraccount-with-user-ref.dto';
import { Types } from 'mongoose';

export class PraisePaginatedWithUserAccountsWithUserRefDto extends PaginatedResponseDto {
  @ApiResponseProperty({
    type: [Praise],
  })
  @Type(() => Praise)
  docs: Praise[];

  @ApiResponseProperty({
    type: UserAccountWithUserRefDto,
  })
  @Type(() => UserAccountWithUserRefDto)
  receiver: UserAccountWithUserRefDto | Types.ObjectId;

  @ApiResponseProperty({
    type: UserAccountWithUserRefDto,
  })
  @Type(() => UserAccountWithUserRefDto)
  giver: UserAccountWithUserRefDto;

  @ApiResponseProperty({
    type: UserAccountWithUserRefDto,
  })
  @Type(() => UserAccountWithUserRefDto)
  forwarder: UserAccountWithUserRefDto;
}
