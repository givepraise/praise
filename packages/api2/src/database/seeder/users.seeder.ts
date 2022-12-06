import { UserRole } from '@/users/interfaces/user-role.interface';
import { User } from '@/users/schemas/users.schema';
import { UsersService } from '@/users/users.service';
import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersSeeder {
  userModel = this.usersService.getModel();
  constructor(private readonly usersService: UsersService) {}

  /**
   * Generate and save a fake User
   *
   * @param {Object} [userData={}]
   * @returns {Promise<UserDocument>}
   */
  seedUser = async (userData: unknown): Promise<User> => {
    const user = await this.userModel.create({
      identityEthAddress: faker.finance.ethereumAddress(),
      rewardsEthAddress: faker.finance.ethereumAddress(),
      username: faker.internet.userName(),
      roles: [UserRole.USER],
      ...(userData as any),
    });

    return user;
  };
}
