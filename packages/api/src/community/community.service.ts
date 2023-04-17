import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { ApiException } from '../shared/exceptions/api-exception';
import { Community } from './schemas/community.schema';
import { PaginatedQueryDto } from '../shared/dto/pagination-query.dto';
import { CommunityPaginatedResponseDto } from './dto/community-pagination-model.dto';
import { CreateCommunityInputDto } from './dto/create-community-input.dto';
import { UpdateCommunityInputDto } from './dto/update-community-input.dto';
import { LinkDiscordBotDto } from './dto/link-discord-bot.dto';
import { ethers } from 'ethers';
import { DiscordLinkState } from './enums/discord-link-state';
import { errorMessages } from '../shared/exceptions/error-messages';
import { randomBytes } from 'crypto';
import { assertOwnersIncludeCreator } from './utils/assert-owners-include-creator';
import { logger } from '../shared/logger';
import { MongoClient } from 'mongodb';
import { MigrationsManager } from '../database/migrations-manager';
import { databaseExists } from '../database/utils/database-exists';
import { dbNameCommunity } from '../database/utils/db-name-community';
import { PaginateModel } from '../shared/interfaces/paginate-model.interface';
import { MONGODB_MAIN_DB } from '../constants/constants.provider';

@Injectable()
export class CommunityService {
  private mongodb: MongoClient;

  constructor(
    @InjectModel(Community.name, 'praise')
    private communityModel: PaginateModel<Community>,
    @InjectConnection('praise')
    private readonly connection: Connection,
  ) {
    this.mongodb = connection.getClient();
  }

  /**
   * Convenience method to get the Community Model
   * @returns
   */
  getModel(): PaginateModel<Community> {
    return this.communityModel;
  }

  async findOne(query: any): Promise<Community> {
    return this.communityModel.findOne(query).lean();
  }

  async findOneById(_id: Types.ObjectId): Promise<Community> {
    return this.findOne({ _id });
  }

  async domainCheck(domain: string): Promise<boolean> {
    if (!process.env.MONGO_ADMIN_URI) {
      throw new ApiException(errorMessages.MONGO_ADMIN_URI_NOT_SET);
    }
    const mongodb = new MongoClient(process.env.MONGO_ADMIN_URI);
    try {
      await mongodb.connect();
      const db = mongodb.db(MONGODB_MAIN_DB);
      const communitites = db.collection('communities');
      const domainFound = await communitites.findOne({ hostname: domain });
      return !!domainFound;
    } catch (error) {
      throw new ApiException(errorMessages.FAILED_TO_QUERY_COMMUNITIES);
    } finally {
      await mongodb.close();
    }
  }

  /**
   * Find all communities. Paginated.
   * @param options
   * @returns
   */
  async findAllPaginated(
    options: PaginatedQueryDto,
  ): Promise<CommunityPaginatedResponseDto> {
    const { sortColumn, sortType } = options;
    const query = {} as any;

    // Sorting - defaults to descending
    const sort =
      sortColumn && sortType ? { [sortColumn]: sortType } : undefined;

    const communityPagination = await this.communityModel.paginate(query, {
      ...options,
      sort,
    });

    if (!communityPagination)
      throw new ApiException(errorMessages.FAILED_TO_QUERY_COMMUNITIES);

    return communityPagination;
  }

  async update(
    _id: Types.ObjectId,
    community: UpdateCommunityInputDto,
  ): Promise<Community> {
    const communityDocument = await this.communityModel.findById(_id);
    if (!communityDocument)
      throw new ApiException(errorMessages.COMMUNITY_NOT_FOUND);
    if (community.owners) {
      assertOwnersIncludeCreator(community.owners, communityDocument.creator);
    }
    const oldDbName = dbNameCommunity(communityDocument);

    for (const [k, v] of Object.entries(community)) {
      communityDocument.set(k, v);
    }

    await communityDocument.save();
    const newDbName = dbNameCommunity(communityDocument);
    if (oldDbName !== newDbName) {
      await this.renameDbOfCommunityIfExists({ oldDbName, newDbName });
    }
    return this.findOneById(communityDocument._id);
  }

  async create(communityDto: CreateCommunityInputDto): Promise<Community> {
    assertOwnersIncludeCreator(communityDto.owners, communityDto.creator);
    const community = new this.communityModel({
      ...communityDto,
      isPublic: true,
      // it produces a random string of 5 characters
      discordLinkNonce: randomBytes(5).toString('hex'),
      database: communityDto.hostname.replace(/\./g, '-'),
    });
    await community.save();
    return community.toObject();
  }

  async linkDiscord(
    communityId: Types.ObjectId,
    linkDiscordBotDto: LinkDiscordBotDto,
  ): Promise<Community> {
    const community = await this.getModel().findById(communityId);
    if (!community) throw new ApiException(errorMessages.COMMUNITY_NOT_FOUND);
    if (community.discordLinkState === DiscordLinkState.ACTIVE)
      throw new ApiException(errorMessages.COMMUNITY_IS_ALREADY_ACTIVE);

    // Generate message to be signed
    const generatedMsg = this.generateLinkDiscordMessage({
      nonce: community.discordLinkNonce as string,
      guildId: community.discordGuildId as string,
      communityId: String(communityId),
    });

    // Verify signature against generated message
    // Recover signer and compare against community creator address
    const signerAddress = ethers.utils.verifyMessage(
      generatedMsg,
      linkDiscordBotDto.signedMessage,
    );
    if (signerAddress?.toLowerCase() !== community.creator.toLowerCase()) {
      throw new ApiException(errorMessages.COMMUNITY_NOT_ALLOWED_SIGNER);
    }

    community.discordLinkState = DiscordLinkState.ACTIVE;
    await community.save();
    const migrationsManager = new MigrationsManager();
    await migrationsManager.migrate(community);
    return community;
  }

  /**
   * Generate a link discord message that will be signed by the frontend user, and validated by the api
   */
  generateLinkDiscordMessage = (params: {
    nonce: string;
    communityId: string;
    guildId: string;
  }): string => {
    return (
      'SIGN THIS MESSAGE TO LINK THE PRAISE DISCORD BOT TO YOUR COMMUNITY.\n\n' +
      `DISCORD GUILD ID:\n${params.guildId}\n\n` +
      `PRAISE COMMUNITY ID:\n${params.communityId}\n\n` +
      `NONCE:\n${params.nonce}`
    );
  };

  renameDbOfCommunityIfExists = async (params: {
    oldDbName: string;
    newDbName: string;
  }): Promise<void> => {
    const { oldDbName, newDbName } = params;
    logger.info(`Setting up community database for `, params);
    try {
      const dbFrom = this.mongodb.db(oldDbName);
      if (!(await databaseExists(oldDbName, this.mongodb))) {
        // There is no db for this community yet, so we dont need to anything
        return;
      }

      const dbTo = this.mongodb.db(newDbName);

      const collections = await dbFrom.listCollections().toArray();
      for (const collection of collections) {
        const collectionName = collection.name;

        // Copy collection data
        const collectionData = await dbFrom
          .collection(collectionName)
          .find()
          .toArray();
        const newCollection = dbTo.collection(collectionName);
        if (collectionData.length === 0) {
          // Skip empty collections
          continue;
        }
        await newCollection.insertMany(collectionData);

        // Copy indexes
        const indexes = await dbFrom.collection(collectionName).indexes();
        for (const index of indexes) {
          await newCollection.createIndex(index.key, index);
        }

        // Drop old database
        await this.mongodb.db().dropDatabase({ dbName: oldDbName });
      }
    } catch (error) {
      logger.error('createDbForCommunity error', error.message);
      throw error;
    }
  };
}
