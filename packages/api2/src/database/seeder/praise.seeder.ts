import { PraiseService } from '@/praise/services/praise.service';
import { PraiseDocument } from '@/praise/schemas/praise.schema';
import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { UserAccountsSeeder } from './useraccounts.seeder';

@Injectable()
export class PraiseSeeder {
  constructor(
    private readonly userAccountsSeeder: UserAccountsSeeder,
    private readonly praiseService: PraiseService,
  ) {}

  /**
   * Generate and save a fake Praise
   *
   * @param {Object} [PraiseData={}]
   * @returns {Promise<PraiseDocument>}
   */
  seedPraise = async (
    PraiseData: Record<string, unknown> = {},
  ): Promise<PraiseDocument> => {
    const createdAt = faker.date.recent();
    const randomGiver = await this.userAccountsSeeder.seedUserAccount();
    const randomReceiver = await this.userAccountsSeeder.seedUserAccount();

    const praise = await this.praiseService.getModel().create({
      reason: faker.lorem.sentence(),
      reasonRaw: faker.lorem.sentence(),
      sourceId: faker.datatype.uuid(),
      sourceName: 'DISCORD',
      score: 0,
      giver: randomGiver._id,
      forwarder: randomGiver._id,
      receiver: randomReceiver._id,
      quantifications: [],
      createdAt,
      updatedAt: createdAt,
      ...PraiseData,
    });

    return praise.toObject();
  };
}
