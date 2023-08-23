import { ApiProperty } from '@nestjs/swagger';

export type ConfigurationValueVariant =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array';

export type ConfigurationValueItemsTypeVariant = 'string' | 'number';

export class ConfigurationValueItemsDto {
  @ApiProperty({
    description: 'Allowed array types',
    enum: ['string', 'number'],
    required: true,
    example: 'string',
  })
  type: ConfigurationValueItemsTypeVariant;
}

export class ConfigurationValueDto {
  @ApiProperty({
    description: 'Type of the setting',
    enum: ['string', 'number', 'boolean', 'array'],
    required: true,
    example: 'string',
  })
  type: ConfigurationValueVariant;

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
    ],
  })
  default: number | string | boolean | number[] | string[];

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
  items?: ConfigurationValueItemsDto;
}
