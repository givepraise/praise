import { PartialType } from '@nestjs/mapped-types';
import { CreatePeriodInputDto } from './create-period-input.dto';

export class UpdatePeriodInputDto extends PartialType(CreatePeriodInputDto) {}
