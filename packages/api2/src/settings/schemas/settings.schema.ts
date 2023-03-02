import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import { Types } from 'mongoose';
import { SettingGroup } from '../enums/setting-group.enum';
import { ExposeId } from '@/shared/decorators/expose-id.decorator';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
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
  @Prop({ required: true })
  key: string;

  @ApiProperty({
    example: '666',
    type: 'string',
  })
  @IsString()
  @Prop()
  value: string;

  @ApiResponseProperty({
    example: 666,
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
  @Prop()
  defaultValue: string;

  @ApiResponseProperty({
    example: 'Integer',
    enum: SettingType,
  })
  @Prop({
    required: true,
    enum: SettingType,
  })
  type: string;

  @ApiResponseProperty({
    example: 'Quantifiers Per Praise',
    type: 'string',
  })
  @Prop({ required: true })
  label: string;

  @ApiResponseProperty({
    example: 'How many redundant quantifications are assigned to each praise?',
    type: 'string',
  })
  @Prop()
  description: string;

  @ApiResponseProperty({
    example: 0,
    type: 'number',
  })
  @Prop({
    required: true,
    enum: SettingGroup,
    type: Number,
  })
  group: number;

  @ApiResponseProperty({
    type: 'string',
  })
  @Prop()
  options: string;

  @ApiResponseProperty({
    example: 0,
    type: 'number',
  })
  @Prop()
  subgroup: number;

  @ApiResponseProperty({
    example: true,
    type: 'boolean',
  })
  @Prop()
  periodOverridable: boolean;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
