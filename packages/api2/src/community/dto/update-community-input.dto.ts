import { OmitType, PartialType } from '@nestjs/swagger';
import { Community } from '../schemas/community.schema';

export class UpdateCommunityInputDto extends PartialType(
  OmitType(Community, ['creator', 'isPublic', 'discordLinkNonce']),
) {}
