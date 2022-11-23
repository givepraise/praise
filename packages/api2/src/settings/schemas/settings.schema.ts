import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose, Transform } from 'class-transformer';
import { Types } from 'mongoose';
import { SettingGroup } from '../interfaces/settings-group.interface';
import { IsSettingValueAllowedBySettingType } from '../validators/settings-type.validator';

export type SettingsDocument = Settings & Document;

@Schema({
  timestamps: true,
  // toJSON: {
  //   virtuals: true,
  // },
})
export class Settings {
  constructor(partial?: Partial<Settings>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Prop({ required: true })
  key: string;

  @Prop()
  @IsSettingValueAllowedBySettingType()
  value: string;

  @Expose()
  get valueRealized(): string | boolean | number | number[] | undefined {
    if (!this || !this.value) return undefined;

    let realizedValue;
    if (this.type === 'Integer') {
      realizedValue = Number.parseInt(this.value);
    } else if (this.type === 'Float') {
      realizedValue = parseFloat(this.value);
    } else if (this.type === 'Boolean') {
      realizedValue = this.value === 'true' ? true : false;
    } else if (this.type === 'IntegerList') {
      realizedValue = this.value
        .split(',')
        .map((v: string) => Number.parseInt(v.trim()));
    } else if (this.type === 'StringList') {
      realizedValue = this.value.split(',').map((v: string) => v.trim());
    } else if (this.type === 'Image') {
      realizedValue = `${process.env.API_URL as string}/uploads/${this.value}`;
    } else if (this.type === 'JSON') {
      realizedValue = this.value ? JSON.parse(this.value) : [];
    } else {
      realizedValue = this.value;
    }

    return realizedValue;
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
    type: [
      {
        type: Number,
        enum: SettingGroup,
      },
    ],
  })
  group: number;

  @Prop()
  options: string;

  @Prop()
  subgroup: number;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
