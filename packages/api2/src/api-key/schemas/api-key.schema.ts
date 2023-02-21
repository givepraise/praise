import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Document, Types } from 'mongoose';
import { ExposeId } from '@/shared/decorators/expose-id.decorator';
import { AuthRole } from '@/auth/enums/auth-role.enum';

export type ApiKeyDocument = ApiKey & Document;

/**
 * Allowed roles for API keys: APIKEY_READWRITE, APIKEY_READ
 * @see AuthRole
 */
@ValidatorConstraint({ name: 'allowedApiKeyRole', async: false })
export class AllowedApiKeyRole implements ValidatorConstraintInterface {
  validate(role: string) {
    return AuthRole.APIKEY_READWRITE === role || AuthRole.APIKEY_READ === role;
  }

  defaultMessage() {
    return 'Role ($value) is not allowed. Allowed roles: APIKEY_READWRITE, APIKEY_READ';
  }
}

@Schema({ timestamps: true })
export class ApiKey {
  constructor(partial?: Partial<ApiKey>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  @ExposeId()
  _id: Types.ObjectId;

  @ApiResponseProperty({
    example: '89f7edbd',
  })
  @Prop({ type: String, required: true })
  name: string;

  @ApiProperty({
    example: 'My API Key',
  })
  @IsNotEmpty()
  @IsString()
  @Prop({ type: String, required: true, minlength: 3, maxlength: 255 })
  description: string;

  @ApiResponseProperty({
    example: '$2b$10$hfRNI.V7ewuN/K.5eSt6oelaQ.FDj6irfUNR9wkKnL/qsNT23aE4i',
  })
  @Prop({ type: String, required: true })
  hash: string;

  @ApiProperty({
    example: 'APIKEY_READWRITE',
    required: true,
  })
  @Validate(AllowedApiKeyRole)
  @Prop({ enum: AuthRole, required: true })
  role: AuthRole;

  @ApiResponseProperty()
  @Prop({ type: Date })
  createdAt: Date;

  @ApiResponseProperty()
  @Prop({ type: Date })
  updatedAt: Date;
}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);
