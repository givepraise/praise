import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { ExposeId } from '../../shared/decorators/expose-id.decorator';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { Period } from '../../periods/schemas/periods.schema';
import { Type } from 'class-transformer';
import { Setting } from './settings.schema';
import { IsString } from 'class-validator';

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
    type: 'string',
  })
  @ExposeId()
  _id: Types.ObjectId;

  @ApiResponseProperty({
    type: Period,
  })
  @Type(() => Period)
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Period',
    required: true,
  })
  period: Types.ObjectId | Period;

  @ApiResponseProperty({
    type: Setting,
  })
  @Type(() => Setting)
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Setting', required: true })
  setting: Types.ObjectId | Setting;

  @ApiProperty({ example: '666', type: 'string', maxLength: 512 })
  @IsString()
  @Prop({ maxLength: 512 })
  value: string;

  @ApiProperty({
    example: 666,
    oneOf: [
      {
        type: 'string',
      },
      { type: 'array', items: { type: 'string' } },
      { type: 'boolean' },
      { type: 'number' },
      { type: 'array', items: { type: 'number' } },
    ],
  })
  valueRealized: string | string[] | boolean | number | number[] | undefined;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const PeriodSettingsSchema = SchemaFactory.createForClass(PeriodSetting);
PeriodSettingsSchema.index({ period: 1, setting: 1 }, { unique: true });
