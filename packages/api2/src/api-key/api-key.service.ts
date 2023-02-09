import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ApiKey, ApiKeyDocument } from './schemas/api-key.schema';
import * as bcrypt from 'bcrypt';
import { CreateApiKeyInputDto } from './dto/create-api-key-input.dto';
import { UtilsProvider } from '@/utils/utils.provider';
import { CreateApiKeyResponseDto } from './dto/create-api-key-response';
import { ServiceException } from '@/shared/exceptions/service-exception';
import { EventLogService } from '@/event-log/event-log.service';
import { EventLogTypeKey } from '@/event-log/enums/event-log-type-key';
import { RequestContext } from 'nestjs-request-context';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectModel(ApiKey.name)
    private readonly apiKeyModel: Model<ApiKeyDocument>,
    private readonly utils: UtilsProvider,
    private readonly eventLogService: EventLogService,
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
    const key = await this.utils.randomString(32);
    const name = key.slice(0, 8);
    const hash = await bcrypt.hash(key, 10);

    const apiKey = new this.apiKeyModel({
      ...createApiKeyDto,
      name,
      hash,
    });
    await apiKey.save();

    this.eventLogService.logEvent({
      typeKey: EventLogTypeKey.AUTHENTICATION,
      description: `Created API key: ${apiKey.name}`,
    });

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
    const apiKey = await this.apiKeyModel.findById(id).lean();
    return apiKey || null;
  }

  /**
   * Finds an API key by key.
   * @param {string} key - The key of the API key to find.
   * @returns {Promise<ApiKey|null>} A promise that resolves to the found API key, or null if no API key is found with the given key.
   */
  async findOneByKey(key: string): Promise<ApiKey | null> {
    const apiKey = await this.apiKeyModel
      .findOne({
        key,
      })
      .lean();
    return apiKey || null;
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

    this.eventLogService.logEvent({
      typeKey: EventLogTypeKey.AUTHENTICATION,
      description: `Revoked API key: ${apiKey.name}`,
    });

    return apiKey.toObject();
  }
}
