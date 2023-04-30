import { ApiProperty } from '@nestjs/swagger';

export type SettingTypeDto = 'string' | 'number' | 'boolean' | 'array';

export class SettingDto {
  @ApiProperty({
    description: 'Type of the setting',
    enum: ['string', 'number', 'boolean', 'array'],
    required: true,
    example: 'string',
  })
  type: SettingTypeDto;

  @ApiProperty({
    description: 'Default value for the setting',
    required: true,
    example: 'Some string',
  })
  default: any;

  @ApiProperty({
    description: 'Description of the setting',
    required: true,
    example: 'Description of the string setting',
  })
  description: string;

  @ApiProperty({
    description: 'Markdown description of the setting',
    required: true,
    example: 'Description of the string setting',
  })
  markdownDescription: string;

  @ApiProperty({
    description: 'Edit presentation style',
    enum: ['multiline'],
    required: false,
    example: 'multiline',
  })
  editPresentation?: 'multiline';

  @ApiProperty({
    description: 'Order of the setting',
    required: true,
    example: 1,
  })
  order: number;

  @ApiProperty({
    description: 'Enum values for string type settings',
    required: false,
    example: ['left', 'right'],
  })
  enum?: string[];

  @ApiProperty({
    description: 'Type of items for array settings',
    required: false,
    example: {
      type: 'string',
    },
  })
  items?: {
    type: SettingTypeDto;
  };
}
