import { UserAccount } from '@/useraccounts/schemas/useraccounts.schema';
import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { UserAccountsService } from '../../useraccounts/useraccounts.service';
import { UsersSeeder } from './users.seeder';

@Injectable()
export class UserAccountsSeeder {
  constructor(
    private readonly userAccountsService: UserAccountsService,
    private readonly userSeeder: UsersSeeder,
  ) {}

  /**
   * Generate and save a fake UserAccount
   *
   * @param {Object} [userAccountData={}]
   * @returns {Promise<UserAccount>}
   */
  seedUserAccount = async (userAccountData?: unknown): Promise<UserAccount> => {
    const randomUser = await this.userSeeder.seedUser();

    const userAccount = await this.userAccountsService.getModel().create({
      user: randomUser._id,
      accountId: faker.datatype.uuid(),
      name: faker.name.firstName(),
      avatarId: faker.datatype.uuid(),
      platform: 'DISCORD',
      activateToken: faker.datatype.string(),
      ...(userAccountData as any),
    });

    return userAccount;
  };
}
