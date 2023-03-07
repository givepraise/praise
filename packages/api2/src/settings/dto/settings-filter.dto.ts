import { PartialType, PickType } from '@nestjs/swagger';
import { Setting } from '../schemas/settings.schema';

export class SettingsFilterDto extends PartialType(
  PickType(Setting, ['key', 'type', 'group', 'subgroup']),
) {}
