import { PartialType, PickType } from '@nestjs/swagger';
import { Community } from '../schemas/community.schema';

export class UpdateCommunityInputDto extends PartialType(
  PickType(Community, ['hostname', 'name', 'email', 'owners']),
) {}
