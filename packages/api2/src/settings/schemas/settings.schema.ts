import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import { Types } from 'mongoose';
import { SettingGroup } from '../interfaces/settings-group.interface';
import { ExposeId } from '@/shared/expose-id.decorator';
import { ApiResponseProperty } from '@nestjs/swagger';

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

  @ApiResponseProperty({
    example: '666',
  })
  @Prop()
  value: string;

  @Expose()
  get valueRealized():
    | string
    | string[]
    | boolean
    | number
    | number[]
    | undefined {
    if (!this || !this.value) return undefined;

    if (this.type === 'Integer') return Number.parseInt(this.value);
    if (this.type === 'Float') return Number.parseFloat(this.value);
    if (this.type === 'Boolean') return this.value === 'true' ? true : false;
    if (this.type === 'IntegerList')
      return this.value
        .split(',')
        .map((v: string) => Number.parseInt(v.trim()));
    if (this.type === 'StringList')
      return this.value.split(',').map((v: string) => v.trim());
    if (this.type === 'Image')
      return `${process.env.API_URL as string}/uploads/${this.value}`;
    if (this.type === 'JSON') return this.value ? JSON.parse(this.value) : [];

    return this.value;
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
