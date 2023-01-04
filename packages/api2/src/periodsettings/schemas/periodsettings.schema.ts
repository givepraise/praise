import { Setting } from '@/settings/schemas/settings.schema';
import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { ExposeId } from '@/shared/expose-id.decorator';

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

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Period', default: null })
  @ExposeId()
  period: Types.ObjectId;
}

export const PeriodSettingsSchema = SchemaFactory.createForClass(PeriodSetting);
