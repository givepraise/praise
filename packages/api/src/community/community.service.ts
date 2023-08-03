import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { ApiException } from '../shared/exceptions/api-exception';
import { Community } from './schemas/community.schema';
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
import { hostNameToDbName } from '../database/utils/host-name-to-db-name';
import { PaginateModel } from '../shared/interfaces/paginate-model.interface';
import { IsNameAvailableResponseDto } from './dto/is-name-available-response-dto';
import { FindAllCommunitiesInputDto } from './dto/find-all-communities-input.dto';

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

  /**
   * Find all communities. Paginated.
   * @param options
   * @returns
   */
  async findAllPaginated(
    options: FindAllCommunitiesInputDto,
  ): Promise<CommunityPaginatedResponseDto> {
    const { sortColumn, sortType } = options;
    const query = {} as any;
    if (options.hostname) {
      query.hostname = options.hostname;
    }

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
    if (community.name) {
      await this.assertCommunityNameAvailable(community.name);
    }
    const oldDbName = hostNameToDbName(communityDocument.hostname);

    for (const [k, v] of Object.entries(community)) {
      communityDocument.set(k, v);
    }

    await communityDocument.save();
    const newDbName = hostNameToDbName(communityDocument.hostname);
    if (oldDbName !== newDbName) {
      await this.renameDbOfCommunityIfExists({ oldDbName, newDbName });
    }
    return this.findOneById(communityDocument._id);
  }

  async create(communityDto: CreateCommunityInputDto): Promise<Community> {
    assertOwnersIncludeCreator(communityDto.owners, communityDto.creator);
    await this.assertCommunityNameAvailable(communityDto.name);
    const community = new this.communityModel({
      ...communityDto,
      isPublic: true,
      // it produces a random string of 5 characters
      discordLinkNonce: randomBytes(5).toString('hex'),
      database: communityDto.hostname.replace(/\./g, '-'),
    });
    await community.save();

    // Create and setup community database
    const migrationsManager = new MigrationsManager();
    await migrationsManager.migrate(community);

    return community;
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
    return community.save();
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

  isCommunityNameAvailable = async (
    name: string,
  ): Promise<IsNameAvailableResponseDto> => {
    const communityNameBlocklist = [
      'about',
      'account',
      'accounts',
      'admin',
      'affiliate',
      'api',
      'app',
      'billing',
      'blog',
      'book',
      'brand',
      'bug',
      'business',
      'career',
      'careers',
      'cdn',
      'chat',
      'client',
      'clients',
      'code',
      'company',
      'compliance',
      'contact',
      'console',
      'control',
      'core',
      'corp',
      'customer',
      'dashboard',
      'data',
      'database',
      'demo',
      'dev',
      'directory',
      'docs',
      'download',
      'education',
      'email',
      'enterprise',
      'events',
      'faq',
      'feedback',
      'file',
      'files',
      'finance',
      'forum',
      'gateway',
      'git',
      'github',
      'givepraise',
      'guide',
      'help',
      'host',
      'hosting',
      'hr',
      'info',
      'integration',
      'internal',
      'invoice',
      'intranet',
      'knowledgebase',
      'labs',
      'landing',
      'legal',
      'license',
      'login',
      'logs',
      'mail',
      'marketing',
      'media',
      'network',
      'news',
      'official',
      'order',
      'partner',
      'partners',
      'payment',
      'portal',
      'praise',
      'press',
      'privacy',
      'prod',
      'project',
      'projects',
      'promo',
      'protocol',
      'public',
      'register',
      'registration',
      'remote',
      'report',
      'reports',
      'resource',
      'resources',
      'sales',
      'sandbox',
      'security',
      'server',
      'service',
      'services',
      'setup',
      'signin',
      'signup',
      'solutions',
      'source',
      'stage',
      'staging',
      'staff',
      'static',
      'status',
      'storage',
      'store',
      'support',
      'system',
      'team',
      'test',
      'terms',
      'tools',
      'tos',
      'training',
      'tutorial',
      'update',
      'user',
      'video',
      'web',
      'webinar',
      'wiki',
      'work',
      'www',
    ];

    if (communityNameBlocklist.includes(name)) {
      return { available: false };
    }
    const community = await this.communityModel.findOne({
      name: name.toString(),
    });
    if (community) {
      return { available: false };
    }
    return { available: true };
  };

  assertCommunityNameAvailable = async (name: string): Promise<void> => {
    const isAvailable = await this.isCommunityNameAvailable(name);
    if (!isAvailable.available) {
      throw new ApiException(errorMessages.COMMUNITY_NAME_NOT_AVAILABLE);
    }
  };
}
