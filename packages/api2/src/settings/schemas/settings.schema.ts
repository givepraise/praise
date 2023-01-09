import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import { Types } from 'mongoose';
import { SettingGroup } from '../interfaces/settings-group.interface';
import { ExposeId } from '@/shared/expose-id.decorator';

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

  @ExposeId()
  _id: Types.ObjectId;

  @Prop({ required: true })
  key: string;

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

  @Prop()
  defaultValue: string;

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

  @Prop({ required: true })
  label: string;

  @Prop()
  description: string;

  @Prop({
    required: true,
    enum: SettingGroup,
    type: Number,
  })
  group: number;

  @Prop()
  options: string;

  @Prop()
  subgroup: number;

  @Prop()
  periodOverridable: boolean;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
