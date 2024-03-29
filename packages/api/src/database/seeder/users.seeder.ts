import { AuthRole } from '../../auth/enums/auth-role.enum';
import { User } from '../../users/schemas/users.schema';
import { UsersService } from '../../users/users.service';
import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersSeeder {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Generate and save a fake User
   *
   * @param {Object} [userData={}]
   * @returns {Promise<UserDocument>}
   */
  seedUser = async (userData?: unknown): Promise<User> => {
    const username = await this.usersService.generateValidUsername(
      faker.internet.userName().substring(0, 15),
    );
    const user = await this.usersService.getModel().create({
      identityEthAddress: faker.finance.ethereumAddress(),
      rewardsEthAddress: faker.finance.ethereumAddress(),
      username,
      roles: [AuthRole.USER],
      ...(userData as any),
    });

    return user;
  };
}
