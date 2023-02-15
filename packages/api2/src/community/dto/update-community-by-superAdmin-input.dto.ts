import { OmitType, PartialType, PickType } from '@nestjs/swagger';
import { Community } from '../schemas/community.schema';

export class UpdateCommunityBySuperAdminInputDto extends PartialType(Community) {

}
