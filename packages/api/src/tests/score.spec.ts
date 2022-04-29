import {
  calculateQuantificationScore,
  calculateQuantificationsCompositeScore,
} from '@praise/utils/score';
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

describe('calculateQuantificationsCompositeScore', () => {
  beforeEach(async () => {
    await PeriodModel.deleteMany({});
  });

  it('composite score is floor of average of included scores', async () => {
    const startDate = new Date();

    const praise = await seedPraise({
      createdAt: startDate.setDate(startDate.getDate() + 5),
    });
    await seedPeriod({
      endDate: startDate.setDate(startDate.getDate() + 10),
    });

    const quantifier = await seedUser();
    await seedQuantification(praise, quantifier, {
      dismissed: false,
      score: 10,
    });

    const quantifier2 = await seedUser();
    await seedQuantification(praise, quantifier2, {
      dismissed: false,
      score: 30,
    });

    const quantifier3 = await seedUser();
    await seedQuantification(praise, quantifier3, {
      dismissed: false,
      score: 50,
    });

    const quantifier4 = await seedUser();
    await seedQuantification(praise, quantifier4, {
      dismissed: false,
      score: 70,
    });

    const score = await calculateQuantificationsCompositeScore(
      praise.quantifications
    );

    expect(score).equals(Math.floor((10 + 30 + 50 + 70) / 4));
  });

  it('incomplete quantifications are not included in composite score', async () => {
    const startDate = new Date();

    const praise = await seedPraise({
      createdAt: startDate.setDate(startDate.getDate() + 5),
    });
    await seedPeriod({
      endDate: startDate.setDate(startDate.getDate() + 10),
    });

    const quantifier = await seedUser();
    await seedQuantification(praise, quantifier, {
      dismissed: false,
      score: 10,
    });

    const quantifier2 = await seedUser();
    await seedQuantification(praise, quantifier2, {
      dismissed: false,
      score: 30,
    });

    const quantifier3 = await seedUser();
    await seedQuantification(praise, quantifier3, {
      dismissed: false,
      score: 50,
    });

    const quantifier4 = await seedUser();
    await seedQuantification(praise, quantifier4, {
      dismissed: false,
      score: 0,
    });

    const score = await calculateQuantificationsCompositeScore(
      praise.quantifications
    );

    expect(score).equals(Math.floor((10 + 30 + 50 + 0) / 3));
  });

  it('dismissed quantifications are included in composite score', async () => {
    const startDate = new Date();

    const praise = await seedPraise({
      createdAt: startDate.setDate(startDate.getDate() + 5),
    });
    await seedPeriod({
      endDate: startDate.setDate(startDate.getDate() + 10),
    });

    const quantifier = await seedUser();
    await seedQuantification(praise, quantifier, {
      dismissed: false,
      score: 10,
    });

    const quantifier2 = await seedUser();
    await seedQuantification(praise, quantifier2, {
      dismissed: false,
      score: 30,
    });

    const quantifier3 = await seedUser();
    await seedQuantification(praise, quantifier3, {
      dismissed: false,
      score: 50,
    });

    const quantifier4 = await seedUser();
    await seedQuantification(praise, quantifier4, {
      dismissed: true,
    });

    const score = await calculateQuantificationsCompositeScore(
      praise.quantifications
    );

    expect(score).equals(Math.floor((10 + 30 + 50 + 0) / 4));
  });

  it('duplicatePraise quantifications are included in composite score', async () => {
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
      score: 10,
    });

    const quantifier2 = await seedUser();
    await seedQuantification(praise, quantifier2, {
      dismissed: false,
      score: 30,
    });

    const quantifier3 = await seedUser();
    await seedQuantification(praise, quantifier3, {
      dismissed: false,
      score: 50,
    });

    const quantifier4 = await seedUser();
    await seedQuantification(praiseOriginal, quantifier4, {
      dismissed: false,
      score: 100,
    });
    await seedQuantification(praise, quantifier4, {
      dismissed: false,
      duplicatePraise: praiseOriginal._id,
    });

    const score = await calculateQuantificationsCompositeScore(
      praise.quantifications
    );

    expect(score).equals(Math.floor((10 + 30 + 50 + 10) / 4));
  });

  it('manually scored quantifications are included in composite score', async () => {
    const startDate = new Date();

    const praise = await seedPraise({
      createdAt: startDate.setDate(startDate.getDate() + 5),
    });
    await seedPeriod({
      endDate: startDate.setDate(startDate.getDate() + 10),
    });

    const quantifier = await seedUser();
    await seedQuantification(praise, quantifier, {
      dismissed: false,
      score: 10,
    });

    const quantifier2 = await seedUser();
    await seedQuantification(praise, quantifier2, {
      dismissed: false,
      score: 30,
    });

    const quantifier3 = await seedUser();
    await seedQuantification(praise, quantifier3, {
      dismissed: false,
      score: 50,
    });

    const quantifier4 = await seedUser();
    await seedQuantification(praise, quantifier4, {
      dismissed: false,
      score: 70,
    });

    const score = await calculateQuantificationsCompositeScore(
      praise.quantifications
    );

    expect(score).equals(Math.floor((10 + 30 + 50 + 70) / 4));
  });
});
