import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UsersService } from './users.service';
import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
  Put,
  Request,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ObjectIdPipe } from '../shared/pipes/object-id.pipe';
import { User } from './schemas/users.schema';
import { ApiParam } from '@nestjs/swagger';
import { Permissions } from '@/auth/decorators/permissions.decorator';
import { Permission } from '@/auth/enums/permission.enum';
import { PermissionsGuard } from '@/auth/guards/permissions.guard';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from '@/auth/interfaces/request-with-user.interface';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(PermissionsGuard)
@UseGuards(AuthGuard(['jwt', 'api-key']))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Permissions(Permission.UsersFind)
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Permissions(Permission.UsersFind)
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id', ObjectIdPipe) id: Types.ObjectId): Promise<User> {
    const user = await this.usersService.findOneById(id);
    if (!user) throw new BadRequestException('User not found.');
    return user;
  }

  @Put(':id')
  @Permissions(Permission.UserProfileUpdate)
  @ApiParam({ name: 'id', type: String })
  async updateProfile(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Request() req: RequestWithUser,
    @Body() user: UpdateUserDto,
  ): Promise<User> {
    if (req.user._id.toString() !== id.toString()) {
      throw new BadRequestException('You can only update your own profile.');
    }
    return this.usersService.update(id, {user.rewardsEthAddress, user.username});
  }

  @Patch(':id/addRole')
  @Permissions(Permission.UsersManageRoles)
  @ApiParam({ name: 'id', type: String })
  async addRole(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() roleChange: UpdateUserRoleDto,
  ): Promise<User> {
    return this.usersService.addRole(id, roleChange);
  }

  @Patch(':id/removeRole')
  @Permissions(Permission.UsersManageRoles)
  @ApiParam({ name: 'id', type: String })
  async removeRole(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() roleChange: UpdateUserRoleDto,
  ): Promise<User> {
    return this.usersService.removeRole(id, roleChange);
  }
}
