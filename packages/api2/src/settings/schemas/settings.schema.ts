import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';
import { SettingGroup } from '../interfaces/settings-group.interface';
import { IsSettingValueAllowedBySettingType } from '../validators/settings-type.validator';

export type SettingsDocument = Settings & Document;

@Schema({ timestamps: true })
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
  value: string;

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
  @IsSettingValueAllowedBySettingType()
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
