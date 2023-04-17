import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ApiKey, ApiKeyDocument } from './schemas/api-key.schema';
import * as bcrypt from 'bcrypt';
import { CreateApiKeyInputDto } from './dto/create-api-key-input.dto';
import { CreateApiKeyResponseDto } from './dto/create-api-key-response';
import { ApiException } from '../shared/exceptions/api-exception';
import { randomBytes } from 'crypto';
import { ConstantsProvider } from '../constants/constants.provider';
import { errorMessages } from '../shared/exceptions/error-messages';
import { logger } from 'src/shared/logger';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectModel(ApiKey.name)
    private readonly apiKeyModel: Model<ApiKeyDocument>,
    private readonly constantsProvider: ConstantsProvider,
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
   * @param {CreateApiKeyInputDto} createApiKeyDto - The request payload containing the API key details.
   * @returns {Promise<CreateApiKeyResponseDto>} A promise that resolves to the response containing the created API key.
   * @throws {ServiceException}, If there is an error while creating the API key.
   */
  async createApiKey(
    createApiKeyDto: CreateApiKeyInputDto,
  ): Promise<CreateApiKeyResponseDto> {
    const key = randomBytes(32).toString('hex');
    const name = key.slice(0, 8);
    const hash = await bcrypt.hash(key, this.constantsProvider.apiKeySalt);

    const apiKey = new this.apiKeyModel({
      ...createApiKeyDto,
      name,
      hash,
    });
    await apiKey.save();

    logger.info(`Created API key: ${apiKey.name}`);

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
  async findOne(id: Types.ObjectId): Promise<ApiKey> {
    const apiKey = await this.apiKeyModel.findById(id).lean();
    if (!apiKey) {
      throw new ApiException(errorMessages.API_KEY_NOT_FOUND);
    }
    return apiKey;
  }

  /**
   * Finds an API key by hash.
   * @param {string} hash - The hash of the API key to find.
   * @returns {Promise<ApiKey|null>} A promise that resolves to the found API key, or null if no API key is found with the given key.
   */
  async findOneByHash(hash: string): Promise<ApiKey> {
    const apiKey = await this.apiKeyModel.findOne({ hash }).lean();
    if (!apiKey) {
      throw new ApiException(errorMessages.API_KEY_NOT_FOUND);
    }
    return apiKey;
  }

  /**
   * Finds all API keys.
   * @returns {Promise<CreateApiKeyResponseDto[]>} A promise that resolves to an array of all API keys.
   */
  async findAll(): Promise<CreateApiKeyResponseDto[]> {
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
      throw new ApiException(errorMessages.API_KEY_NOT_FOUND);
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
    const apiKey = await this.findOne(id);
    await this.apiKeyModel.deleteOne({ _id: id });

    logger.info(`Revoked API key: ${apiKey.name}`);

    return apiKey;
  }
}
