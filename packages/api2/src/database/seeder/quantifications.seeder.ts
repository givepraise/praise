import { QuantificationsService } from '@/quantifications/quantifications.service';
import { Quantification } from '@/quantifications/schemas/quantifications.schema';
import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QuantificationsSeeder {
  QuantificationModel = this.QuantificationsService.getModel();
  constructor(
    private readonly QuantificationsService: QuantificationsService,
  ) {}

  /**
   * Generate and save a fake Quantification
   *
   * @param {Object} [QuantificationData={}]
   * @returns {Promise<Quantification>}
   */
  seedQuantification = async (
    QuantificationData: Record<string, unknown> = {},
  ): Promise<Quantification> => {
    const createdAt = faker.date.recent();

    const Quantification = await this.QuantificationModel.create({
      score: faker.datatype.number({ min: 0, max: 100 }),
      scoreRealized: faker.datatype.number({ min: 0, max: 100 }),
      dismissed: faker.datatype.boolean(),
      quantifier: null,
      createdAt,
      updatedAt: createdAt,
      ...QuantificationData,
    });

    return Quantification;
  };
}
