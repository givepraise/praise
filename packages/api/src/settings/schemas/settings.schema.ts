import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import { Types } from 'mongoose';
import { SettingGroup } from '../enums/setting-group.enum';
import { ExposeId } from '../../shared/decorators/expose-id.decorator';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { valueToValueRealized } from '../utils/value-to-value-realized.util';
import { SettingType } from '../enums/setting-type.enum';

export type SettingDocument = Setting & Document;

@Schema({
  timestamps: true,
})
export class Setting {
  constructor(partial?: Partial<Setting>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  @ApiResponseProperty({ example: '621f802b813dbdbaddeaf799', type: 'string' })
  @ExposeId()
  _id: Types.ObjectId;

  @ApiResponseProperty({
    example: 'SETTING_KEY',
    type: 'string',
  })
  @Prop({ required: true, maxlength: 255 })
  key: string;

  @ApiProperty({
    example: '666',
    type: 'string',
    maxLength: 512,
  })
  @IsString()
  @Prop({ maxlength: 512 })
  value: string;

  @ApiProperty({
    example: 666,
    oneOf: [
      {
        type: 'string',
      },
      { type: 'array', items: { type: 'string' } },
      { type: 'boolean' },
      { type: 'number' },
      { type: 'array', items: { type: 'number' } },
    ],
  })
  @Expose()
  get valueRealized():
    | string
    | string[]
    | boolean
    | number
    | number[]
    | undefined {
    return valueToValueRealized(this.value, this.type);
  }

  @ApiResponseProperty({
    example: '555',
    type: 'string',
  })
  @Prop({ maxlength: 512, required: false })
  defaultValue?: string;

  @ApiResponseProperty({
    enum: SettingType,
  })
  @IsEnum(SettingType)
  @Prop({
    required: true,
    enum: SettingType,
  })
  type: SettingType;

  @ApiResponseProperty({
    example: 'Quantifiers Per Praise',
    type: 'string',
  })
  @Prop({ maxlength: 255, required: false })
  label?: string;

  @ApiResponseProperty({
    example: 'How many redundant quantifications are assigned to each praise?',
    type: 'string',
  })
  @Prop({ maxlength: 255, required: false })
  description?: string;

  @ApiResponseProperty({
    example: 0,
    type: 'number',
  })
  @Prop({
    required: true,
    enum: SettingGroup,
    type: Number,
  })
  group: SettingGroup;

  @ApiResponseProperty({
    type: 'string',
  })
  @Prop({ maxlength: 255, required: false })
  options?: string;

  @ApiResponseProperty({
    example: 0,
    type: 'number',
  })
  @Prop({ required: false })
  subgroup?: number;

  @ApiResponseProperty({
    example: true,
    type: 'boolean',
  })
  @Prop({ required: true, default: false })
  periodOverridable: boolean;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
