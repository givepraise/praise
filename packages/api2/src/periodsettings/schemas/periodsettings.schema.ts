import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { ExposeId } from '@/shared/decorators/expose-id.decorator';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { Period } from '@/periods/schemas/periods.schema';
import { Type } from 'class-transformer';
import { Setting } from '@/settings/schemas/settings.schema';
import { IsNotEmpty, IsString } from 'class-validator';

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

  @ApiResponseProperty({
    example: '62291b7ea8b1619f78818524',
  })
  @ExposeId()
  _id: Types.ObjectId;

  @ApiResponseProperty({
    type: [Period],
  })
  @Type(() => Period)
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Period', default: null })
  period: Types.ObjectId | Period;

  @ApiResponseProperty({
    type: [Setting],
  })
  @Type(() => Setting)
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Setting', default: null })
  setting: Types.ObjectId | Setting;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Prop()
  value: string;

  @ApiResponseProperty({
    example: 666,
  })
  valueRealized: string | string[] | boolean | number | number[] | undefined;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const PeriodSettingsSchema = SchemaFactory.createForClass(PeriodSetting);
PeriodSettingsSchema.index({ period: 1, setting: 1 }, { unique: true });
