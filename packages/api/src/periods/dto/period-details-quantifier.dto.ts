import { Quantification } from '../../quantifications/schemas/quantifications.schema';
import { User } from '../../users/schemas/users.schema';
import { ApiResponseProperty, PickType } from '@nestjs/swagger';

export class PeriodDetailsQuantifierDto extends PickType(User, [
  '_id',
  'username',
  'identityEthAddress',
  'createdAt',
  'updatedAt',
]) {
  constructor(partial?: Partial<PeriodDetailsQuantifierDto>) {
    super(partial);
    if (partial) {
      Object.assign(this, partial);
    }
  }

  @ApiResponseProperty({ type: 'number', example: 1 })
  finishedCount: number;

  @ApiResponseProperty({ type: 'number', example: 1 })
  praiseCount: number;

  quantifications: Quantification[];
}
