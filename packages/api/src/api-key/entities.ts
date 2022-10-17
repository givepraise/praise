import { Schema, model } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { ApiKeyDocument, ApiKeyAccess } from './types';

const apiKeySchema = new Schema(
  {
    access: {
      type: [
        {
          type: String,
          enum: [ApiKeyAccess],
        },
      ],
      default: [ApiKeyAccess.LIMITED],
    },
    apiKey: { type: String, select: false },
    name: { type: String, select: false },
  },
  {
    timestamps: true,
  }
);

apiKeySchema.plugin(mongoosePagination);

export const ApiKeyModel = model<ApiKeyDocument, Pagination<ApiKeyDocument>>(
  'ApiKey',
  apiKeySchema
);
