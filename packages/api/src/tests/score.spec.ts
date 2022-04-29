import { calculateQuantificationScore } from '@praise/utils/score';
import {
  seedUser,
  seedPraise,
  seedQuantification,
  seedPeriod,
} from '../pre-start/seed';
import { expect } from 'chai';
import { PeriodModel } from '@period/entities';
import { settingValue } from '@shared/settings';
import { logger } from 'ethers';

describe('calculateQuantificationScore', () => {
  beforeEach(async () => {
    await PeriodModel.deleteMany({});
  });

  it('dismissed praise scores 0', async () => {
    const praise = await seedPraise();
    const quantifier = await seedUser();
    const quantification = await seedQuantification(praise, quantifier, {
      dismissed: true,
    });

    const score = await calculateQuantificationScore(quantification);

    expect(score).equals(0);
  });

  it('duplicate praise scores (PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE * original)', async () => {
    const startDate = new Date();

    const praiseOriginal = await seedPraise({
      createdAt: startDate.setDate(startDate.getDate() + 5),
    });
    const praise = await seedPraise({
      createdAt: startDate.setDate(startDate.getDate() + 5),
    });
    const period = await seedPeriod({
      endDate: startDate.setDate(startDate.getDate() + 10),
    });

    const duplicatePraisePercentage = (await settingValue(
      'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE',
      period._id
    )) as number;

    logger.info(`duplicatePraisePercentage ${duplicatePraisePercentage}`);

    const quantifier = await seedUser();
    const quantificationOriginal = await seedQuantification(
      praiseOriginal,
      quantifier,
      {
        dismissed: false,
        score: 100,
      }
    );
    const quantification = await seedQuantification(praise, quantifier, {
      dismissed: false,
      duplicatePraise: praiseOriginal._id,
    });

    const score = await calculateQuantificationScore(quantification);

    expect(score).equals(
      quantificationOriginal.score * duplicatePraisePercentage
    );
  });

  it('duplicate praise scores 0 if original was dismissed', async () => {
    const startDate = new Date();

    const praiseOriginal = await seedPraise({
      createdAt: startDate.setDate(startDate.getDate() + 5),
    });
    const praise = await seedPraise({
      createdAt: startDate.setDate(startDate.getDate() + 5),
    });
    await seedPeriod({
      endDate: startDate.setDate(startDate.getDate() + 10),
    });

    const quantifier = await seedUser();
    await seedQuantification(praise, quantifier, {
      dismissed: false,
      score: 100,
    });
    const quantification = await seedQuantification(praise, quantifier, {
      dismissed: false,
      duplicatePraise: praiseOriginal._id,
    });

    const score = await calculateQuantificationScore(quantification);

    expect(score).equals(0);
  });

  it('manually scored praise recevies given score', async () => {
    const startDate = new Date();

    const praise = await seedPraise({
      createdAt: startDate.setDate(startDate.getDate() + 5),
    });
    await seedPeriod({
      endDate: startDate.setDate(startDate.getDate() + 10),
    });

    const quantifier = await seedUser();
    const quantification = await seedQuantification(praise, quantifier, {
      dismissed: false,
      duplicatePraise: undefined,
      score: 100,
    });

    const score = await calculateQuantificationScore(quantification);

    expect(score).equals(100);
  });
});
