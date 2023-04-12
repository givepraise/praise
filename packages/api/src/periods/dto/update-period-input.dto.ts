import { PartialType } from '@nestjs/swagger';
import { CreatePeriodInputDto } from './create-period-input.dto';

export class UpdatePeriodInputDto extends PartialType(CreatePeriodInputDto) {}
