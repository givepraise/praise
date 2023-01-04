import { Setting } from '@/settings/schemas/settings.schema';
import { IsSettingValueAllowedBySettingType } from '@/settings/validators/settings-type.validator';
import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { ExposeId } from '@/shared/expose-id.decorator';

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

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Period', default: null })
  @ExposeId()
  period: Types.ObjectId;

  // @Transform(({ value }) => value.toString())
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Setting', default: null })
  setting: Types.ObjectId;

  @Prop()
  @IsSettingValueAllowedBySettingType()
  value: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const PeriodSettingsSchema = SchemaFactory.createForClass(PeriodSetting);
