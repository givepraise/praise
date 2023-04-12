import { PickType } from '@nestjs/swagger';
import { Setting } from '../schemas/settings.schema';

export class SetSettingDto extends PickType(Setting, ['value']) {}
