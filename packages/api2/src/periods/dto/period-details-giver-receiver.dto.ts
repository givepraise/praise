import { Quantification } from '@/quantifications/schemas/quantifications.schema';
import { UserAccount } from '@/useraccounts/schemas/useraccounts.schema';
import { ApiResponseProperty } from '@nestjs/swagger';

export class PeriodDetailsGiverReceiverDto {
  @ApiResponseProperty({ example: '5f5f5f5f5f5f5f5f5f5f5f5f' })
  _id: string;

  @ApiResponseProperty({ type: 'number', example: '5' })
  praiseCount: number;

  @ApiResponseProperty({ type: [Quantification] })
  quantifications?: Array<Quantification>;

  @ApiResponseProperty({ type: 'number', example: 144 })
  scoreRealized: number;

  @ApiResponseProperty({ type: [UserAccount] })
  userAccounts: UserAccount[];
}
