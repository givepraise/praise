import { QuantificationsService } from '../../quantifications/services/quantifications.service';
import { Quantification } from '../../quantifications/schemas/quantifications.schema';
import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QuantificationsSeeder {
  constructor(
    private readonly quantificationsService: QuantificationsService,
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

    const Quantification = await this.quantificationsService.getModel().create({
      score: 0,
      scoreRealized: 0,
      dismissed: faker.datatype.boolean(),
      quantifier: null,
      createdAt,
      updatedAt: createdAt,
      ...QuantificationData,
    });

    return Quantification;
  };
}
