import { UserRoleChangeDto } from './dto/userRoleChange.dto';
import { User, UserDocument } from './schemas/users.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from './interfaces/userRole.interface';
import { UpdateUserDto } from './dto/update-user.dto';

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

  async findOneById(_id: Types.ObjectId): Promise<User> {
    const user = await this.userModel.findById(_id).populate('accounts').lean();
    if (!user) throw new NotFoundException('User not found.');
    return new User(user);
  }

  async findOneByEth(identityEthAddress: string): Promise<User> {
    const user = await this.userModel
      .findOne({ identityEthAddress })
      .populate('accounts')
      .lean();
    if (!user) throw new NotFoundException('User not found.');
    return new User(user);
  }

  async addRole(
    _id: Types.ObjectId,
    roleChange: UserRoleChangeDto,
  ): Promise<User> {
    const userDocument = await this.userModel.findById(_id);
    if (!userDocument) throw new NotFoundException('User not found.');

    if (userDocument.roles.includes(roleChange.role))
      throw new BadRequestException(`User already has role ${roleChange.role}`);

    userDocument.roles.push(roleChange.role);
    await userDocument.save();
    await this.revokeAccess(_id);

    // await logEvent(
    //   EventLogTypeKey.PERMISSION,
    //   `Added role "${role}" to user with id "${(
    //     user._id as Types.ObjectId
    //   ).toString()}"`,
    //   {
    //     userId: res.locals.currentUser._id,
    //   }
    // );

    return this.findOneById(_id);
  }

  async removeRole(
    _id: Types.ObjectId,
    roleChange: UserRoleChangeDto,
  ): Promise<User> {
    const userDocument = await this.userModel.findById(_id);
    if (!userDocument) throw new NotFoundException('User not found.');

    const role = roleChange.role;
    const roleIndex = userDocument.roles.indexOf(role);

    // It is not allowed to remove the last admin!
    if (role === UserRole.ADMIN) {
      const allAdmins = await this.userModel.find({
        roles: { $in: [`${UserRole.ADMIN}`] },
      });
      if (allAdmins.length <= 1) {
        throw new BadRequestException(
          'It is not allowed to remove the last admin!',
        );
      }
    }

    // Verify user has role before removing
    if (roleIndex === -1)
      throw new BadRequestException(`User does not have role ${role}`);

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
    //       throw new BadRequestError(
    //         'Cannot remove quantifier currently assigned to quantification period'
    //       );
    //   }

    userDocument.roles.splice(roleIndex, 1);
    await userDocument.save();
    await this.revokeAccess(_id);

    //   await logEvent(
    //     EventLogTypeKey.PERMISSION,
    //     `Removed role "${role}" from user with id "${(
    //       user._id as Types.ObjectId
    //     ).toString()}`,
    //     {
    //       userId: res.locals.currentUser._id,
    //     }
    //   );

    return this.findOneById(_id);
  }

  async revokeAccess(_id: Types.ObjectId): Promise<User> {
    const userDocument = await this.userModel.findById(_id);
    if (!userDocument) throw new NotFoundException('User not found.');

    userDocument.set('accessToken', undefined);
    userDocument.set('nonce', undefined);
    await userDocument.save();

    return this.findOneById(_id);
  }

  async updateUser(_id: Types.ObjectId, user: UpdateUserDto): Promise<User> {
    const userDocument = await this.userModel.findById(_id);
    if (!userDocument) throw new NotFoundException('User not found.');

    for (const [k, v] of Object.entries(user)) {
      userDocument.set(k, v);
      console.log(`${JSON.stringify(k)}: ${JSON.stringify(v)}`);
    }
    await userDocument.save();

    return this.findOneById(_id);
  }
}
