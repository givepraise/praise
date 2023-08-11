import { ApiProperty } from '@nestjs/swagger';

export type SettingTypeVariant = 'string' | 'number' | 'boolean' | 'array';

export type SettingItemTypeVariant = 'string' | 'number' | 'boolean';

export class SettingItemsDto {
  @ApiProperty({
    description: 'Allowed array types',
    enum: ['string', 'number', 'boolean'],
    required: true,
    example: 'string',
  })
  type: SettingItemTypeVariant;
}

export class SettingDto {
  @ApiProperty({
    description: 'Type of the setting',
    enum: ['string', 'number', 'boolean', 'array'],
    required: true,
    example: 'string',
  })
  type: SettingTypeVariant;

  @ApiProperty({
    description: 'Default value for the setting',
    required: true,
    example: 666,
    oneOf: [
      { type: 'number' },
      {
        type: 'string',
      },
      { type: 'boolean' },
      { type: 'array', items: { type: 'number' } },
      { type: 'array', items: { type: 'string' } },
      { type: 'array', items: { type: 'boolean' } },
    ],
  })
  default: number | string | boolean | number[] | string[] | boolean[];

  @ApiProperty({
    description: 'Description of the setting',
    required: true,
    example: 'Description of the string setting',
  })
  description: string;

  @ApiProperty({
    description: 'Markdown description of the setting',
    required: false,
    example: 'Description of the string setting',
  })
  markdownDescription?: string;

  @ApiProperty({
    description: 'Edit presentation style',
    enum: ['multiline'],
    required: false,
    example: 'multiline',
  })
  editPresentation?: 'multiline';

  @ApiProperty({
    description: 'Order of the setting',
    required: false,
    example: 1,
  })
  order?: number;

  @ApiProperty({
    description: 'Enum values for string type settings',
    required: false,
    example: ['left', 'right'],
  })
  enum?: string[];

  @ApiProperty({
    description: 'Defines the type of items for array settings',
    required: false,
  })
  items?: SettingItemsDto;
}
