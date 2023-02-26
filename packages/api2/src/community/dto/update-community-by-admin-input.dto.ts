import { OmitType, PartialType, PickType } from '@nestjs/swagger';
import { Community } from '../schemas/community.schema';

export class UpdateCommunityByAdminInputDto extends PartialType(
  // Community admin can't edit discordLinkState (or maybe more fields should be not editable by community admin)
  OmitType(Community, ['discordLinkState', 'isPublic', 'creator', 'discordLinkNonce'])
) {

}
