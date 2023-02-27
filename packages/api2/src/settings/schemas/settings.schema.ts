import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import { Types } from 'mongoose';
import { SettingGroup } from '../enums/setting-group.enum';
import { ExposeId } from '@/shared/decorators/expose-id.decorator';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { valueToValueRealized } from '../utils/value-to-value-realized.util';

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

  @ApiResponseProperty({ example: '621f802b813dbdbaddeaf799' })
  @ExposeId()
  _id: Types.ObjectId;

  @ApiResponseProperty({
    example: 'SETTING_KEY',
  })
  @Prop({ required: true })
  key: string;

  @ApiProperty({
    example: '666',
  })
  @IsNotEmpty()
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
  })
  @Prop()
  defaultValue: string;

  @ApiResponseProperty({
    example: 'Integer',
  })
  @Prop({
    required: true,
    enum: [
      'Integer',
      'Float',
      'String',
      'Textarea',
      'Boolean',
      'IntegerList',
      'StringList',
      'Image',
      'Radio',
      'JSON',
    ],
  })
  type: string;

  @ApiResponseProperty({
    example: 'Quantifiers Per Praise',
  })
  @Prop({ required: true })
  label: string;

  @ApiResponseProperty({
    example: 'How many redundant quantifications are assigned to each praise?',
  })
  @Prop()
  description: string;

  @ApiResponseProperty({
    example: '0',
  })
  @Prop({
    required: true,
    enum: SettingGroup,
    type: Number,
  })
  group: number;

  @ApiResponseProperty()
  @Prop()
  options: string;

  @ApiResponseProperty({
    example: '0',
  })
  @Prop()
  subgroup: number;

  @ApiResponseProperty({
    example: 'true',
  })
  @Prop()
  periodOverridable: boolean;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
