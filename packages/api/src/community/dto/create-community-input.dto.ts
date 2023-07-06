import { Community } from '../schemas/community.schema';
import { PickType } from '@nestjs/swagger';

export class CreateCommunityInputDto extends PickType(Community, [
  'name',
  'email',
  'creator',
  'owners',
  'hostname',
  'discordGuildId',
  'twitterBot',
]) {}
