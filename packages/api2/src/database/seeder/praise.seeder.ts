import { PraiseService } from '@/praise/praise.service';
import { PraiseDocument } from '@/praise/schemas/praise.schema';
import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { UserAccountsSeeder } from './useraccounts.seeder';

@Injectable()
export class PraiseSeeder {
  PraiseModel = this.PraiseService.getModel();
  constructor(
    private readonly UserAccountsSeeder: UserAccountsSeeder,
    private readonly PraiseService: PraiseService,
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
    const randomGiver = await this.UserAccountsSeeder.seedUserAccount();
    const randomReceiver = await this.UserAccountsSeeder.seedUserAccount();

    const Praise = await this.PraiseModel.create({
      reason: faker.lorem.sentence(),
      reasonRaw: faker.lorem.sentence(),
      sourceId: faker.datatype.uuid(),
      sourceName: 'DISCORD',
      score: faker.datatype.number(),
      giver: randomGiver._id,
      receiver: randomReceiver._id,
      quantifications: [],
      createdAt,
      updatedAt: createdAt,
      ...PraiseData,
    });

    return Praise;
  };
}
