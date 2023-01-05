import { PartialType } from '@nestjs/swagger';
import { Setting } from '../schemas/settings.schema';

export class SetSettingDto extends PartialType(Setting) {}
