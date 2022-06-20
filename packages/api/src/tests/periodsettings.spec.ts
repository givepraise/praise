import { Wallet } from 'ethers';
import { seedPeriod, seedUser } from '../pre-start/seed';
import { expect } from 'chai';
import { PeriodModel } from '@period/entities';
import { loginUser } from './utils';
import { faker } from '@faker-js/faker';
import { addDays } from 'date-fns';
import { PeriodSettingsModel } from '@periodsettings/entities';

describe('GET /api/periods/:periodId/settings/all', () => {
  beforeEach(async () => {
    await PeriodModel.deleteMany({});
  });

  it('200 response with json body', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod();

    return this.client
      .get(
        `/api/periodsettings/${period._id.toString() as string}/settings/all`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
  });

  it('401 response with json body if user not authenticated', async function () {
    const period = await seedPeriod();

    return this.client
      .get(
        `/api/periodsettings/${period._id.toString() as string}/settings/all`
      )
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);
  });

  it('401 response with json body if period does not exist', function () {
    return this.client
      .get(
        `/api/periodsettings/${faker.database.mongodbObjectId()}/settings/all`
      )
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);
  });

  it('response body contains list of settings', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({ ethereumAddress: wallet.address });

    // note: loginUser creates 1 UserEventLog
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod();
    const period2 = await seedPeriod({
      endDate: faker.date.future(1, addDays(period.endDate, 10)),
    });
    await seedPeriod({
      endDate: faker.date.future(1, addDays(period2.endDate, 10)),
    });

    const response = await this.client
      .get(
        `/api/periodsettings/${period._id.toString() as string}/settings/all`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    const periodSettings = await PeriodSettingsModel.find({
      period: period._id,
    });

    expect(response.body.length).equals(periodSettings.length);
    expect(response.body[0]).to.have.any.keys(
      '_id',
      'key',
      'label',
      'type',
      'group',
      'description',
      'value'
    );
  });
});

describe('GET /api/periods/:periodId/settings/:settingId', () => {
  beforeEach(async () => {
    await PeriodModel.deleteMany({});
  });

  it('200 response with json body containing a periodsetting', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod();
    const periodsetting = await PeriodSettingsModel.findOne({
      period: period._id,
      key: 'PRAISE_QUANTIFIERS_ASSIGN_ALL',
    });

    const response = await this.client
      .get(
        `/api/periodsettings/${period._id.toString() as string}/settings/${
          periodsetting?._id.toString() as string
        }`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body._id).to.equal(periodsetting?._id.toString());
    expect(response.body).to.have.all.keys(
      '_id',
      'key',
      'value',
      'valueRealized',
      'type',
      'label',
      'description',
      'period'
    );
  });

  it('404 response with json body if period does not exist', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod();
    const periodsetting = await PeriodSettingsModel.findOne({
      period: period._id,
      key: 'PRAISE_QUANTIFIERS_ASSIGN_ALL',
    });

    return this.client
      .get(
        `/api/periodsettings/${faker.database.mongodbObjectId()}/settings/${
          periodsetting?._id.toString() as string
        }`
      )

      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404);
  });

  it('404 response with json body if periodsetting does not exist', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod();

    return this.client
      .get(
        `/api/periodsettings/${
          period._id.toString() as string
        }/settings/${faker.database.mongodbObjectId()}`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404);
  });

  it('401 response with json body if user not authenticated', async function () {
    const period = await seedPeriod();
    const periodsetting = await PeriodSettingsModel.findOne({
      period: period._id,
      key: 'PRAISE_QUANTIFIERS_ASSIGN_ALL',
    });

    return this.client
      .get(
        `/api/periodsettings/${period._id.toString() as string}/settings/${
          periodsetting?._id.toString() as string
        }`
      )
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);
  });
});
