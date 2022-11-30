import { Setting } from '@/settings/schemas/settings.schema';
import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { SchemaTypes, Types } from 'mongoose';

export type PeriodSettingDocument = PeriodSetting & Document;

@Schema({
  timestamps: true,
})
export class PeriodSetting extends Setting {
  constructor(
    @InjectModel('Settings') public readonly settings: Partial<Setting>,
    partial?: Partial<PeriodSetting>,
  ) {
    super(settings);

    if (partial) {
      Object.assign(this, partial);
    }
  }

  @Transform(({ value }) => value.toString())
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Period', default: null })
  period: Types.ObjectId;
}

export const PeriodSettingsSchema = SchemaFactory.createForClass(PeriodSetting);
