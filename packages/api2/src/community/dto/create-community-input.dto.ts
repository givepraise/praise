import { Community } from '../schemas/community.schema';
import { PickType } from '@nestjs/swagger';

export class CreateCommunityInputDto extends PickType(Community,
  ['name', 'creator', 'owners', 'hostname']) {}
