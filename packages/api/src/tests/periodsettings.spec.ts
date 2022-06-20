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

