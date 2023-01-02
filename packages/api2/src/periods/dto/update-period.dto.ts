import { PartialType } from '@nestjs/mapped-types';
import { CreatePeriod } from './create-period.dto';

export class UpdatePeriod extends PartialType(CreatePeriod) {}
