import { UpdateUserRoleInputDto } from './dto/update-user-role-input.dto';
import { User, UserDocument } from './schemas/users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { UpdateUserInputDto } from './dto/update-user-input.dto';
import { CreateUserInputDto } from './dto/create-user-input.dto';
import { ServiceException } from '@/shared/service-exception';
import { UserAccount } from '@/useraccounts/schemas/useraccounts.schema';
import { EventLogService } from '@/event-log/event-log.service';
import { EventLogTypeKey } from '@/event-log/enums/event-log-type-key';
import { AuthRole } from '@/auth/enums/auth-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private eventLogService: EventLogService,
  ) {}

  getModel(): Model<UserDocument> {
    return this.userModel;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().populate('accounts').lean();
  }

  async findOneById(_id: Types.ObjectId): Promise<User> {
    return this.userModel.findById(_id).populate('accounts').lean();
  }

  async findOneByEth(identityEthAddress: string): Promise<User> {
    return this.userModel
      .findOne({ identityEthAddress })
      .populate('accounts')
      .lean();
  }

  async addRole(
    _id: Types.ObjectId,
    roleChange: UpdateUserRoleInputDto,
  ): Promise<User> {
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
  ): Promise<User> {
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

    //   // If user is currently assigned to the active quantification round, and role is QUANTIFIER throw error
    //   const activePeriods: PeriodDocument[] = await findActivePeriods();

    //   if (role === UserRole.QUANTIFIER && activePeriods.length > 0) {
    //     const dateRanges: PeriodDateRange[] = await Promise.all(
    //       activePeriods.map((period) => getPeriodDateRangeQuery(period))
    //     );
    //     const assignedPraiseCount = await countPraiseWithinDateRanges(dateRanges, {
    //       'quantifications.quantifier': user._id,
    //     });
    //     if (assignedPraiseCount > 0)
    //       throw new PraiseException(
    //         'Cannot remove quantifier currently assigned to quantification period'
    //       );
    //   }

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
    const updatedUserDocument = await userDocument.save();
    return updatedUserDocument.toObject();
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
