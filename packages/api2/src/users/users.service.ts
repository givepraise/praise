import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { User, UserDocument } from './schemas/users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { UserRole } from './interfaces/user-role.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ServiceException } from '@/shared/service-exception';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async findAll(): Promise<User[]> {
    const users = await this.userModel.find().populate('accounts').lean();
    return users.map((user) => new User(user));
  }

  async findOneById(_id: Types.ObjectId): Promise<User | null> {
    const user = await this.userModel.findById(_id).populate('accounts').lean();
    if (user) return new User(user);
    return null;
  }

  async findOneByEth(identityEthAddress: string): Promise<User | null> {
    const user = await this.userModel
      .findOne({ identityEthAddress })
      .populate('accounts')
      .lean();
    if (user) return new User(user);
    return null;
  }

  async addRole(
    _id: Types.ObjectId,
    roleChange: UpdateUserRoleDto,
  ): Promise<User> {
    const userDocument = await this.userModel.findById(_id);
    if (!userDocument) throw new ServiceException('User not found.');

    if (userDocument.roles.includes(roleChange.role))
      throw new ServiceException(`User already has role ${roleChange.role}`);

    userDocument.roles.push(roleChange.role);
    await userDocument.save();

    // await logEvent(
    //   EventLogTypeKey.PERMISSION,
    //   `Added role "${role}" to user with id "${(
    //     user._id as Types.ObjectId
    //   ).toString()}"`,
    //   {
    //     userId: res.locals.currentUser._id,
    //   }
    // );

    return this.revokeAccess(_id);
  }

  async removeRole(
    _id: Types.ObjectId,
    roleChange: UpdateUserRoleDto,
  ): Promise<User> {
    const userDocument = await this.userModel.findById(_id);
    if (!userDocument) throw new ServiceException('User not found.');

    const role = roleChange.role;
    const roleIndex = userDocument.roles.indexOf(role);

    // It is not allowed to remove the last admin!
    if (role === UserRole.ADMIN) {
      const allAdmins = await this.userModel.find({
        roles: { $in: [`${UserRole.ADMIN}`] },
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
    await userDocument.save();

    //   await logEvent(
    //     EventLogTypeKey.PERMISSION,
    //     `Removed role "${role}" from user with id "${(
    //       user._id as Types.ObjectId
    //     ).toString()}`,
    //     {
    //       userId: res.locals.currentUser._id,
    //     }
    //   );

    return this.revokeAccess(_id);
  }

  async revokeAccess(_id: Types.ObjectId): Promise<User> {
    const userDocument = await this.userModel.findById(_id);
    if (!userDocument) throw new ServiceException('User not found.');

    userDocument.set('accessToken', undefined);
    userDocument.set('nonce', undefined);
    return userDocument.save();
  }

  async update(_id: Types.ObjectId, user: UpdateUserDto): Promise<User> {
    const userDocument = await this.userModel.findById(_id);
    if (!userDocument) throw new ServiceException('User not found.');

    for (const [k, v] of Object.entries(user)) {
      userDocument.set(k, v);
    }
    return userDocument.save();
  }

  async create(userDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(userDto);
    return createdUser.save();
  }
}
