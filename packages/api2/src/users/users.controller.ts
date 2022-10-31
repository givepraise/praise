import { UserRoleChangeDto } from './dto/userRoleChange.dto';
import { UsersService } from './users.service';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ObjectIdPipe } from '../objectId.pipe';
import { User } from './schemas/users.schema';
import { ApiParam } from '@nestjs/swagger';

@Controller('users')
@SerializeOptions({
  excludePrefixes: ['__'],
})
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id', ObjectIdPipe) id: Types.ObjectId): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Patch(':id/addRole')
  @ApiParam({ name: 'id', type: String })
  async addRole(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() roleChange: UserRoleChangeDto,
  ): Promise<User> {
    return this.usersService.addRole(id, roleChange);
  }

  @Patch(':id/removeRole')
  @ApiParam({ name: 'id', type: String })
  async removeRole(
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() roleChange: UserRoleChangeDto,
  ): Promise<User> {
    return this.usersService.removeRole(id, roleChange);
  }
}
