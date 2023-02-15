import { Types } from 'mongoose';
import { CommunityStatus } from '../../../dist/src/community/enums/community-status';

export class CreateCommunityInputDto {
  user?: Types.ObjectId;
  userAccount?: Types.ObjectId;
  periodId?: Types.ObjectId;
  typeKey: CommunityStatus;
  description: string;
}
