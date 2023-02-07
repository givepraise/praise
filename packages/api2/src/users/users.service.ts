import * as fs from 'fs';
import * as csv from 'fast-csv';
import duckdb from 'duckdb';
import { UpdateUserRoleInputDto } from './dto/update-user-role-input.dto';
import {
  User,
  UserDocument,
  UsersExportSqlSchema,
} from './schemas/users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { UpdateUserInputDto } from './dto/update-user-input.dto';
import { CreateUserInputDto } from './dto/create-user-input.dto';
import { ServiceException } from '@/shared/exceptions/service-exception';
import { UserAccount } from '@/useraccounts/schemas/useraccounts.schema';
import { EventLogService } from '@/event-log/event-log.service';
import { EventLogTypeKey } from '@/event-log/enums/event-log-type-key';
import { AuthRole } from '@/auth/enums/auth-role.enum';
import { UserWithStatsDto } from './dto/user-with-stats.dto';
import { Praise, PraiseDocument } from '@/praise/schemas/praise.schema';
import { UserStatsDto } from './dto/user-stats.dto';
import { parse } from 'json2csv';
import { PeriodDateRangeDto } from '@/periods/dto/period-date-range.dto';
import { Period } from '@/periods/schemas/periods.schema';
import { PeriodsService } from '@/periods/services/periods.service';
import { PraiseService } from '@/praise/services/praise.service';
import { exec } from '@/shared/duckdb.shared';
import { allExportsDirPath } from '@/shared/fs.shared';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Praise.name)
    private praiseModel: Model<PraiseDocument>,
    private eventLogService: EventLogService,
    private periodService: PeriodsService,
    private praiseService: PraiseService,
  ) {}

  getModel(): Model<UserDocument> {
    return this.userModel;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().populate('accounts').lean();
  }

  async generateCsvExport() {
    // Fields to include in the csv
    const includeFields = [
      '_id',
      'username',
      'identityEthAddress',
      'rewardsEthAddress',
      'roles',
      'createdAt',
      'updatedAt',
    ];

    // Serialization rules
    const transform = (doc: UserDocument) => ({
      _id: doc._id,
      username: doc.username,
      identityEthAddress: doc.identityEthAddress,
      rewardsEthAddress: doc.rewardsEthAddress,
      roles: doc.roles,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    });

    const exportDirName = await this.getExportDirName();
    const exportDirPath = `${allExportsDirPath}/users/${exportDirName}`;

    // Create the export folder if it doesn't exist
    if (!fs.existsSync(exportDirPath)) {
      fs.mkdirSync(exportDirPath, { recursive: true });
    }

    // Return a promise that resolves when the csv is done
    return new Promise((resolve) => {
      const cursor = this.userModel
        .find()
        .select(includeFields.join(' '))
        .cursor();

      // Create a csv writer that transforms the data using our rules
      const csvWriter = csv.format({
        headers: true,
        transform,
      });

      // Pipe the csvWriter to a file
      csvWriter.pipe(fs.createWriteStream(`${exportDirPath}/users.csv`));

      // Resolve promise when csvWriter is done
      csvWriter.on('end', () => {
        resolve(true);
      });

      // Pipe the cursor to the csvWriter
      cursor.pipe(csvWriter);
    });
  }

  /**
   * Generates all export files - csv and parquet
   */
  async generateAllExports() {
    const exportDirName = await this.getExportDirName();
    const exportDirPath = `${allExportsDirPath}/users/${exportDirName}`;

    await this.generateCsvExport();

    // Create a duckdb database, import the csv file, and export it to parquet
    const db = new duckdb.Database(':memory:');
    await exec(db, `CREATE TABLE users (${UsersExportSqlSchema})`);
    await exec(
      db,
      `COPY users FROM '${exportDirPath}/users.csv' (AUTO_DETECT TRUE, HEADER TRUE);`,
    );
    await exec(
      db,
      `COPY users TO '${exportDirPath}/users.parquet' (FORMAT PARQUET, COMPRESSION ZSTD);`,
    );
  }

  /**
   * The export directory name is the _id of the last inserted document
   */
  async getExportDirName(): Promise<string> {
    const latestAdded = await this.findLatestAdded();
    return latestAdded._id.toString();
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
    if (!user) throw new ServiceException('User not found.');
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
  async findLatestAdded(): Promise<User> {
    const user = await this.userModel
      .find()
      .limit(1)
      .sort({ $natural: -1 })
      .lean();
    if (!user[0]) throw new ServiceException('User not found.');
    return user[0];
  }

  async addRole(
    _id: Types.ObjectId,
    roleChange: UpdateUserRoleInputDto,
  ): Promise<UserWithStatsDto> {
    const userDocument = await this.userModel.findById(_id);
    if (!userDocument) throw new ServiceException('User not found.');

    if (userDocument.roles.includes(roleChange.role))
      throw new ServiceException(`User already has role ${roleChange.role}`);

    userDocument.roles.push(roleChange.role);
    const user = await userDocument.save();

    await this.eventLogService.logEvent({
      typeKey: EventLogTypeKey.PERMISSION,
      description: `Added role "${roleChange.role}" to user with id "${(
        user._id as Types.ObjectId
      ).toString()}"`,
    });

    return this.findOneById(user._id);
  }

  async removeRole(
    _id: Types.ObjectId,
    roleChange: UpdateUserRoleInputDto,
  ): Promise<UserWithStatsDto> {
    const userDocument = await this.userModel.findById(_id);
    if (!userDocument) throw new ServiceException('User not found.');

    const role = roleChange.role;
    const roleIndex = userDocument.roles.indexOf(role);

    // It is not allowed to remove the last admin!
    if (role === AuthRole.ADMIN) {
      const allAdmins = await this.userModel.find({
        roles: { $in: [`${AuthRole.ADMIN}`] },
      });
      if (allAdmins.length <= 1) {
        throw new ServiceException(
          'It is not allowed to remove the last admin!',
        );
      }
    }

    // Verify user has role before removing
    if (roleIndex === -1)
      throw new ServiceException(`User does not have role ${role}`);

    // If user is currently assigned to the active quantification round, and role is QUANTIFIER throw error
    const activePeriods: Period[] =
      await this.periodService.findActivePeriods();

    if (role === AuthRole.QUANTIFIER && activePeriods.length > 0) {
      const dateRanges: PeriodDateRangeDto[] = await Promise.all(
        activePeriods.map((period) =>
          this.periodService.getPeriodDateRangeQuery(period),
        ),
      );
      const assignedPraiseCount =
        await this.praiseService.countPraiseWithinDateRanges(dateRanges, {
          'quantifications.quantifier': _id,
        });
      if (assignedPraiseCount > 0)
        throw new ServiceException(
          'Cannot remove quantifier currently assigned to quantification period',
        );
    }

    userDocument.roles.splice(roleIndex, 1);
    const user = await userDocument.save();

    await this.eventLogService.logEvent({
      typeKey: EventLogTypeKey.PERMISSION,
      description: `Removed role "${roleChange.role}" from user with id "${(
        user._id as Types.ObjectId
      ).toString()}"`,
    });

    return this.findOneById(user._id);
  }

  async update(_id: Types.ObjectId, user: UpdateUserInputDto): Promise<User> {
    const userDocument = await this.userModel.findById(_id);
    if (!userDocument) throw new ServiceException('User not found.');

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
   * Generate username from user account name
   * If username is already taken than create one with discriminator
   *
   * @param userAccount
   * @returns {Promise<string>}
   */
  generateUserNameFromAccount = async (
    userAccount: UserAccount,
  ): Promise<string | null> => {
    let username;
    if (
      userAccount.platform === 'DISCORD' &&
      userAccount.name.indexOf('#') > 0
    ) {
      username = userAccount.name.split('#')[0];
    } else {
      username = userAccount.name;
    }

    const exists = await this.userModel.find({ username }).lean();
    if (exists.length === 0) return username;
    if (userAccount.platform === 'DISCORD') return userAccount.name;
    return null;
  };
}
