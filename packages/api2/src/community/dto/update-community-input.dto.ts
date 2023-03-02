import { PartialType } from '@nestjs/swagger';
import { Community } from '../schemas/community.schema';

export class UpdateCommunityInputDto extends PartialType(Community) {}
