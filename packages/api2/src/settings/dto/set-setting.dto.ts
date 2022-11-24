import { PartialType } from '@nestjs/mapped-types';
import { Settings } from '../schemas/settings.schema';

export class SetSettingDto extends PartialType(Settings) {}
