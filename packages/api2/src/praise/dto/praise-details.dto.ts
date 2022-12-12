import { PartialType } from '@nestjs/mapped-types';
import { Praise } from '../schemas/praise.schema';

export class PraiseDetailsDto extends PartialType(Praise) {}
