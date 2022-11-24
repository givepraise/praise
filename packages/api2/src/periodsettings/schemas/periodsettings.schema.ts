import { Settings } from '@/settings/schemas/settings.schema';
import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { SchemaTypes, Types } from 'mongoose';

export type PeriodSettingsDocument = PeriodSettings & Document;

@Schema({
  timestamps: true,
})
export class PeriodSettings extends Settings {
  constructor(
    @InjectModel('Settings') public readonly settings: Partial<Settings>,
    partial?: Partial<PeriodSettings>,
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

export const PeriodSettingsSchema =
  SchemaFactory.createForClass(PeriodSettings);
