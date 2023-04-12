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
import { ExposeId } from '../../shared/decorators/expose-id.decorator';
import { AuthRole } from '../../auth/enums/auth-role.enum';

export type ApiKeyDocument = ApiKey & Document;

/**
 * Allowed roles for API keys: API_KEY_READWRITE, API_KEY_READ
 * @see AuthRole
 */
@ValidatorConstraint({ name: 'allowedApiKeyRole', async: false })
export class AllowedApiKeyRole implements ValidatorConstraintInterface {
  validate(role: string) {
    return (
      AuthRole.API_KEY_READWRITE === role || AuthRole.API_KEY_READ === role
    );
  }

  defaultMessage() {
    return 'Role ($value) is not allowed. Allowed roles: API_KEY_READWRITE, API_KEY_READ';
  }
}

@Schema({ timestamps: true })
export class ApiKey {
  constructor(partial?: Partial<ApiKey>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  @ApiResponseProperty({
    example: '639b178f19296ee0f2d0585d',
    type: 'string',
  })
  @ExposeId()
  _id: Types.ObjectId;

  @ApiResponseProperty({
    example: '89f7edbd',
    type: 'string',
  })
  @Prop({ type: String, required: true, minlength: 3, maxlength: 255 })
  name: string;

  @ApiProperty({
    example: 'My API Key',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  @Prop({ type: String, required: true, minlength: 3, maxlength: 255 })
  description: string;

  @ApiResponseProperty({
    example: '$2b$10$hfRNI.V7ewuN/K.5eSt6oelaQ.FDj6irfUNR9wkKnL/qsNT23aE4i',
    type: 'string',
  })
  @Prop({ type: String, required: true, maxlength: 255 })
  hash: string;

  @ApiProperty({
    required: true,
    enum: AuthRole,
  })
  @Validate(AllowedApiKeyRole)
  @Prop({ enum: AuthRole, required: true, type: String })
  role: AuthRole;

  @ApiResponseProperty()
  @Prop({ type: Date })
  createdAt: Date;

  @ApiResponseProperty()
  @Prop({ type: Date })
  updatedAt: Date;
}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);
