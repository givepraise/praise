import { PartialType } from '@nestjs/mapped-types';
import { Period } from '../schemas/periods.schema';

export class UpdatePeriod extends PartialType(Period) {}
