import { Setting } from '@/settings/schemas/settings.schema';
import { IsSettingValueAllowedBySettingType } from '@/settings/validators/settings-type.validator';
import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { SchemaTypes, Types } from 'mongoose';

export type PeriodSettingDocument = PeriodSetting & Document;

@Schema({
  timestamps: true,
})
export class PeriodSetting {
  constructor(partial?: Partial<PeriodSetting>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Transform(({ value }) => value.toString())
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Period', default: null })
  period: Types.ObjectId;

  @Transform(({ value }) => value.toString())
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Setting', default: null })
  setting: Types.ObjectId;

  @Prop()
  @IsSettingValueAllowedBySettingType()
  value: string;
}

export const PeriodSettingsSchema = SchemaFactory.createForClass(PeriodSetting);
