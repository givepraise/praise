import { PickType } from '@nestjs/swagger';
import { ExportInputDto } from './export-input.dto';

export class ExportInputFormatOnlyDto extends PickType(ExportInputDto, [
  'format',
]) {}
