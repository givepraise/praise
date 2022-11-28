import { PartialType } from '@nestjs/mapped-types';
import { Setting } from '../schemas/settings.schema';

export class SetSettingDto extends PartialType(Setting) {}
