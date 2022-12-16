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

  /**
   * Returns the Mongoose model for the API key document.
   * @returns {Model<ApiKeyDocument>} The Mongoose model for the API key document.
   */
  getModel(): Model<ApiKeyDocument> {
    return this.apiKeyModel;
  }

  /**
   * Creates a new API key.
   * @param {CreateApiKeyRequest} createApiKeyDto - The request payload containing the API key details.
   * @returns {Promise<CreateApiKeyResponse>} A promise that resolves to the response containing the created API key.
   * @throws {ServiceException} If there is an error while creating the API key.
   */
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

  /**
   * Finds an API key by ID.
   * @param {Types.ObjectId} id - The ID of the API key to find.
   * @returns {Promise<ApiKey|null>} A promise that resolves to the found API key, or null if no API key is found with the given ID.
   */
  async findOne(id: Types.ObjectId): Promise<ApiKey | null> {
    const apiKey = await this.apiKeyModel.findById(id);
    return apiKey ? apiKey.toObject() : null;
  }

  /**
   * Finds all API keys.
   * @returns {Promise<CreateApiKeyResponse[]>} A promise that resolves to an array of all API keys.
   */
  async findAll(): Promise<CreateApiKeyResponse[]> {
    const apiKeys = await this.apiKeyModel.find();
    return apiKeys.map((apiKey) => apiKey.toObject());
  }

  /**
   * Updates the description of an API key.
   * @param {Types.ObjectId} id - The ID of the API key to update.
   * @param {string} description - The new description for the API key.
   * @returns {Promise<ApiKey>} A promise that resolves to the updated API key.
   * @throws {ServiceException} If there is an error while updating the API key.
   */
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

  /**
   * Revokes an API key.
   * @param {Types.ObjectId} id - The ID of the API key to revoke.
   * @returns {Promise<ApiKey>} A promise that resolves to the revoked API key.
   * @throws {ServiceException} If there is an error while revoking the API key.
   */
  async revoke(id: Types.ObjectId): Promise<ApiKey> {
    const apiKey = await this.apiKeyModel.findById(id);
    if (!apiKey) {
      throw new ServiceException('Invalid API key ID');
    }
    await this.apiKeyModel.deleteOne({ _id: id });
    return apiKey.toObject();
  }
}
