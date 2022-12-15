import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ApiKey, ApiKeyDocument } from './schemas/api-key.schema';
import * as bcrypt from 'bcrypt';
import { CreateApiKeyRequest } from './dto/create-api-key-request.dto';
import { UtilsProvider } from '@/utils/utils.provider';
import { CreateApiKeyResponse } from './dto/create-api-key-response';
import { ServiceException } from '@/shared/service-exception';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectModel(ApiKey.name)
    private readonly apiKeyModel: Model<ApiKeyDocument>,
    private readonly utils: UtilsProvider,
  ) {}

  getModel(): Model<ApiKeyDocument> {
    return this.apiKeyModel;
  }

  async createApiKey(
    createApiKeyDto: CreateApiKeyRequest,
  ): Promise<CreateApiKeyResponse> {
    const key = await this.utils.randomString(32);
    const name = key.slice(0, 8);
    const hash = await bcrypt.hash(key, 10);

    const apiKey = new this.apiKeyModel({
      ...createApiKeyDto,
      name,
      hash,
    });
    await apiKey.save();
    return {
      ...apiKey.toObject(),
      key,
    };
  }

  async findOne(id: Types.ObjectId): Promise<ApiKey | null> {
    const apiKey = await this.apiKeyModel.findById(id);
    return apiKey ? apiKey.toObject() : null;
  }

  async findAll(): Promise<CreateApiKeyResponse[]> {
    const apiKeys = await this.apiKeyModel.find();
    return apiKeys.map((apiKey) => apiKey.toObject());
  }

  async updateDescription(
    id: Types.ObjectId,
    description: string,
  ): Promise<ApiKey> {
    const apiKey = await this.apiKeyModel.findById(id);
    if (!apiKey) {
      throw new ServiceException('Invalid API key ID');
    }
    apiKey.description = description;
    apiKey.save();
    return apiKey.toObject();
  }

  async revoke(id: Types.ObjectId): Promise<ApiKey> {
    const apiKey = await this.apiKeyModel.findById(id);
    if (!apiKey) {
      throw new ServiceException('Invalid API key ID');
    }
    await this.apiKeyModel.deleteOne({ _id: id });
    return apiKey.toObject();
  }
}
