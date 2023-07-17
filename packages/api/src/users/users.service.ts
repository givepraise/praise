import { UpdateUserRoleInputDto } from './dto/update-user-role-input.dto';
import { User, UserDocument } from './schemas/users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Cursor, Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { UpdateUserInputDto } from './dto/update-user-input.dto';
import { CreateUserInputDto } from './dto/create-user-input.dto';
import { ApiException } from '../shared/exceptions/api-exception';
import { UserAccount } from '../useraccounts/schemas/useraccounts.schema';
import { AuthRole } from '../auth/enums/auth-role.enum';
import { UserWithStatsDto } from './dto/user-with-stats.dto';
import { Praise, PraiseDocument } from '../praise/schemas/praise.schema';
import { UserStatsDto } from './dto/user-stats.dto';
import { Period } from '../periods/schemas/periods.schema';
import { PeriodsService } from '../periods/services/periods.service';
import { PraiseService } from '../praise/services/praise.service';
import { errorMessages } from '../shared/exceptions/error-messages';
import { logger } from '../shared/logger';
import { randomBytes } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Praise.name)
    private praiseModel: Model<PraiseDocument>,
    private periodService: PeriodsService,
    private praiseService: PraiseService,
  ) {}

  getModel(): Model<UserDocument> {
    return this.userModel;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().populate('accounts').lean();
  }

  async getUserStats(user: UserDocument): Promise<UserStatsDto | null> {
    if (!user.accounts || user.accounts.length === 0) return null;
    const accountIds = user.accounts?.map((a) => new Types.ObjectId(a._id));

    const receivedStats = await this.praiseModel.aggregate([
      {
        $match: {
          receiver: { $in: accountIds },
        },
      },
      {
        $group: {
          _id: '$receiver',
          totalScore: { $sum: '$score' },
          totalCount: { $sum: 1 },
        },
      },
    ]);

    const givenStats = await this.praiseModel.aggregate([
      {
        $match: {
          giver: { $in: accountIds },
        },
      },
      {
        $group: {
          _id: '$giver',
          totalScore: { $sum: '$score' },
          totalCount: { $sum: 1 },
        },
      },
    ]);

    return {
      receivedTotalScore: receivedStats[0]?.totalScore || 0,
      receivedTotalCount: receivedStats[0]?.totalCount || 0,
      givenTotalScore: givenStats[0]?.totalScore || 0,
      givenTotalCount: givenStats[0]?.totalCount || 0,
    };
  }

  async findOne(query: any): Promise<UserWithStatsDto> {
    const user = await this.userModel
      .findOne(query)
      .populate('accounts')
      .lean();
    if (!user) throw new ApiException(errorMessages.USER_NOT_FOUND);
    const userStats = await this.getUserStats(user);
    return { ...user, ...userStats };
  }

  async findOneById(_id: Types.ObjectId): Promise<UserWithStatsDto> {
    return this.findOne({ _id });
  }

  async findOneByEth(identityEthAddress: string): Promise<UserWithStatsDto> {
    return this.findOne({ identityEthAddress });
  }

  /**
   * Find the latest added user
   */
  async findLatest(): Promise<User> {
    const user = await this.userModel
      .find()
      .limit(1)
      .sort({ $natural: -1 })
      .lean();
    if (!user[0]) throw new ApiException(errorMessages.USER_NOT_FOUND);
    return user[0];
  }

  async addRole(
    _id: Types.ObjectId,
    roleChange: UpdateUserRoleInputDto,
  ): Promise<UserWithStatsDto> {
    const userDocument = await this.userModel.findById(_id);
    if (!userDocument) throw new ApiException(errorMessages.USER_NOT_FOUND);

    if (userDocument.roles.includes(roleChange.role))
      throw new ApiException(
        errorMessages.INVALID_ROLE,
        `User already has role ${roleChange.role}`,
      );

    userDocument.roles.push(roleChange.role);
    const user = await userDocument.save();

    logger.info(
      `Added role "${roleChange.role}" to user with "${user.username}"`,
    );

    return this.findOneById(user._id);
  }

  async removeRole(
    _id: Types.ObjectId,
    roleChange: UpdateUserRoleInputDto,
  ): Promise<UserWithStatsDto> {
    const userDocument = await this.userModel.findById(_id);
    if (!userDocument) throw new ApiException(errorMessages.USER_NOT_FOUND);

    const role = roleChange.role;
    const roleIndex = userDocument.roles.indexOf(role);

    // It is not allowed to remove the last admin!
    if (role === AuthRole.ADMIN) {
      const allAdmins = await this.userModel.find({
        roles: { $in: [`${AuthRole.ADMIN}`] },
      });
      if (allAdmins.length <= 1) {
        throw new ApiException(
          errorMessages.ITS_NOT_ALLOWED_TO_REMOVE_THE_LAST_ADMIN,
        );
      }
    }

    // Verify user has role before removing
    if (roleIndex === -1)
      throw new ApiException(
        errorMessages.INVALID_ROLE,
        `User does not have role ${role}`,
      );

    // If user is currently assigned to the active quantification round, and role is QUANTIFIER throw error
    const activePeriods: Period[] =
      await this.periodService.findActivePeriods();

    if (role === AuthRole.QUANTIFIER && activePeriods.length > 0) {
      let isAssignedQuantifier = false;
      for (const period of activePeriods) {
        const periodDetails = await this.periodService.findPeriodDetails(
          period._id,
        );
        if (periodDetails.quantifiers?.find((q) => q._id.equals(_id))) {
          isAssignedQuantifier = true;
          break;
        }
      }
      if (isAssignedQuantifier)
        throw new ApiException(errorMessages.CAN_NOT_REMOVE_QUANTIFIER);
    }

    userDocument.roles.splice(roleIndex, 1);
    const user = await userDocument.save();

    logger.info(
      `Removed role "${roleChange.role}" from user with id "${(
        user._id as Types.ObjectId
      ).toString()}"`,
    );

    return this.findOneById(user._id);
  }

  async update(_id: Types.ObjectId, user: UpdateUserInputDto): Promise<User> {
    const userDocument = await this.userModel.findById(_id);
    if (!userDocument) throw new ApiException(errorMessages.USER_NOT_FOUND);

    for (const [k, v] of Object.entries(user)) {
      userDocument.set(k, v);
    }

    await userDocument.save();

    return this.findOneById(userDocument._id);
  }

  async create(userDto: CreateUserInputDto): Promise<User> {
    const createdUser = new this.userModel(userDto);
    await createdUser.save();
    await createdUser.populate('accounts');
    return createdUser.toObject();
  }

  /**
   * A valid username is:
   * - is lowercase
   * - minimum 3 characters
   * - maximum 50 characters
   * - only alphanumeric characters, underscores, dots, and hyphens
   * - cannot start with a dot or hyphen
   * - cannot end with a dot or hyphen
   * - cannot contain two dots, two hyphens, or two underscores in a row
   * - should not already be taken
   */
  async generateValidUsername(username: string): Promise<string> {
    let newUsername = username
      .toLowerCase()
      .replace(/\s/g, '_')
      .replace(/[^a-z0-9_.-]/g, '')
      .replace(/[-_.]{2,}/g, '')
      .replace(/^[^a-z0-9]+/g, '')
      .replace(/[^a-z0-9]+$/g, '')
      .substring(0, 50);

    // If the new username is less than 4 characters, pad it with a random number to ensure a minimum length of 4
    while (newUsername.length < 4) {
      newUsername = `${newUsername}${Math.floor(
        Math.random() * 900 + 100,
      )}`.substring(0, 50);
    }

    // Check if the username already exists
    const exists = await this.userModel.find({ username: newUsername }).lean();

    // If the username does not exist, return it
    if (exists.length === 0) return newUsername;

    // If the username exists, try again with a random number appended
    return this.generateValidUsername(
      `${newUsername.substring(0, 15)}${Math.floor(Math.random() * 900 + 100)}`,
    );
  }

  /**
   * Generate username from user account name
   * If username is already taken than create one with discriminator
   *
   * @param userAccount
   * @returns {Promise<string>}
   */
  async generateUserNameFromAccount(
    userAccount: UserAccount,
  ): Promise<string | null> {
    let username;
    if (
      userAccount.platform === 'DISCORD' &&
      userAccount.name.indexOf('#') > 0
    ) {
      username = userAccount.name.split('#')[0];
    } else {
      username = userAccount.name;
    }

    return this.generateValidUsername(username);
  }

  /**
   * Creates a cursor for all users in the database
   */
  async exportCursor(includeFields: string[]): Promise<Cursor<User, never>> {
    // Include only the fields that are specified in the includeFields array
    const projection: { [key: string]: 1 } = includeFields.reduce(
      (obj: { [key: string]: 1 }, field: string) => {
        obj[field] = 1;
        return obj;
      },
      {},
    );
    return this.userModel.aggregate([{ $project: projection }]).cursor();
  }

  /**
   * Seed users into database with USER and ADMIN roles,
   *  as defined in env variable ADMINS
   *
   * @returns Promise
   */
  setEnvAdminUsers = async (): Promise<void> => {
    const admins = process.env.ADMINS as string;
    const ethAddresses = admins
      .split(',')
      .filter(Boolean)
      .map((item) => {
        return item.trim();
      });

    const users: User[] = [];
    for (const eth of ethAddresses) {
      let user = await this.userModel.findOne({ identityEthAddress: eth });

      if (user) {
        logger.info(`Setting admin role for user ${eth}`);
        if (!user.roles.includes(AuthRole.ADMIN)) {
          user.roles.push(AuthRole.ADMIN);
          await user.save();
        }
        if (!user.roles.includes(AuthRole.USER)) {
          user.roles.push(AuthRole.USER);
          await user.save();
        }
      } else {
        logger.info(`Creating admin user ${eth}`);

        user = new this.userModel({
          identityEthAddress: eth,
          rewardsEthAddress: eth,
          username: eth,
          roles: [AuthRole.ADMIN, AuthRole.USER],
        });
        await user.save();
        await user.populate('accounts');
        users.push(user.toObject());
      }
    }
  };

  /**
   * Generates a nonce for the user and returns it.
   *
   * @param identityEthAddress Ethereum address of the user
   * @returns User with updated nonce
   */
  async generateNonce(identityEthAddress: string): Promise<User> {
    // Generate random nonce used for auth request
    const nonce = randomBytes(10).toString('hex');

    try {
      // Find user by their Ethereum address, update nonce
      const user = await this.findOneByEth(identityEthAddress);
      return this.update(user._id, { nonce });
    } catch (e) {
      // No user found, create a new user
      return this.create({
        identityEthAddress,
        rewardsEthAddress: identityEthAddress,
        username: await this.generateValidUsername(identityEthAddress),
        roles: [AuthRole.USER],
        nonce,
      });
    }
  }
}
