import {
  calculateQuantificationScore,
  calculateQuantificationsCompositeScore,
  calculateReceiverCompositeScore,
} from '@praise/utils/score';
import {
  seedUser,
  seedPraise,
  seedQuantification,
  seedPeriod,
  seedUserAccount,
} from '../pre-start/seed';
import { expect } from 'chai';
import { PeriodModel } from '@period/entities';
import { PeriodDetailsReceiver } from '@period/types';
import { PraiseModel } from '@praise/entities';
import { settingValue } from '@shared/settings';
import { sum } from 'lodash';
import { getPeriodDateRangeQuery } from '@period/utils';
import faker from 'faker';
import { add } from 'date-fns';

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

describe('calculateReceiverCompositeScore', () => {
  beforeEach(async () => {
    await PeriodModel.deleteMany({});
    await PraiseModel.deleteMany({});
  });

  it('receiver composite score is sum of all quantification composite scores', async () => {
    const user = await seedUser();
    const receiver = await seedUserAccount(user);

    const praise = await seedPraise({
      receiver: receiver._id,
      createdAt: faker.date.soon(3),
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

    const praise2 = await seedPraise({
      receiver: receiver._id,
      createdAt: faker.date.soon(4),
    });
    await seedQuantification(praise2, quantifier, {
      dismissed: false,
      score: 10,
    });
    await seedQuantification(praise2, quantifier2, {
      dismissed: false,
      score: 30,
    });
    await seedQuantification(praise2, quantifier3, {
      dismissed: false,
      score: 50,
    });
    await seedQuantification(praise2, quantifier4, {
      dismissed: false,
      score: 70,
    });

    const praise3 = await seedPraise({
      receiver: receiver._id,
      createdAt: faker.date.soon(5),
    });
    await seedQuantification(praise3, quantifier, {
      dismissed: false,
      score: 10,
    });
    await seedQuantification(praise3, quantifier2, {
      dismissed: false,
      score: 30,
    });
    await seedQuantification(praise3, quantifier3, {
      dismissed: false,
      score: 50,
    });
    await seedQuantification(praise3, quantifier4, {
      dismissed: false,
      score: 70,
    });

    const praise4 = await seedPraise({
      receiver: receiver._id,
      createdAt: faker.date.soon(6),
    });
    await seedQuantification(praise4, quantifier, {
      dismissed: false,
      score: 10,
    });
    await seedQuantification(praise4, quantifier2, {
      dismissed: false,
      score: 30,
    });
    await seedQuantification(praise4, quantifier3, {
      dismissed: false,
      score: 50,
    });
    await seedQuantification(praise4, quantifier4, {
      dismissed: false,
      score: 70,
    });

    const period = await seedPeriod({
      endDate: add(new Date(), { days: 10 }),
    });

    const dateRangeQuery = await getPeriodDateRangeQuery(period);
    const periodDetailsReceivers: PeriodDetailsReceiver[] =
      await PraiseModel.aggregate([
        {
          $match: {
            createdAt: dateRangeQuery,
          },
        },
        {
          $lookup: {
            from: 'useraccounts',
            localField: 'receiver',
            foreignField: '_id',
            as: 'userAccounts',
          },
        },
        {
          $group: {
            _id: '$receiver',
            praiseCount: { $count: {} },
            quantifications: {
              $push: '$quantifications',
            },
            userAccounts: { $first: '$userAccounts' },
          },
        },
      ]);

    const score = await calculateReceiverCompositeScore(
      periodDetailsReceivers[0]
    );

    const compositeScores = await Promise.all(
      [praise, praise2, praise3, praise4].map((p) =>
        calculateQuantificationsCompositeScore(p.quantifications)
      )
    );

    expect(score).equals(sum(compositeScores));
  });
});
