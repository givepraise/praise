import { Wallet } from 'ethers';
import {
  seedPeriod,
  seedPeriodSetting,
  seedUser,
} from '@database/seeder/entities';
import { expect } from 'chai';
import { PeriodModel } from '@period/entities';
import { loginUser } from './utils';
import { faker } from '@faker-js/faker';
import { addDays } from 'date-fns';
import { PeriodSettingsModel } from '@periodsettings/entities';

describe('GET /api/periodsettings/:periodId/settings/all', () => {
  beforeEach(async () => {
    await PeriodModel.deleteMany({});
    await PeriodSettingsModel.deleteMany({});
  });

  it('200 response with json body contains list of settings', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({ ethereumAddress: wallet.address });

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
    expect(response.body[0]).to.have.all.keys(
      '_id',
      'key',
      'label',
      'type',
      'description',
      'value',
      'valueRealized',
      'period'
    );
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
});

describe('GET /api/periodsettings/:periodId/settings/:settingId', () => {
  beforeEach(async () => {
    await PeriodModel.deleteMany({});
    await PeriodSettingsModel.deleteMany({});
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

  it('404 response if period does not exist', async function () {
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

  it('404 response if periodsetting does not exist', async function () {
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

  it('401 response if user not authenticated', async function () {
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

describe('PATCH /api/admin/periodsettings/:periodId/settings/:settingId/set', () => {
  beforeEach(async () => {
    await PeriodModel.deleteMany({});
    await PeriodSettingsModel.deleteMany({});
  });

  it('200 response with json body containing updated period', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod();
    const periodsetting = await PeriodSettingsModel.findOne({
      period: period._id,
      key: 'PRAISE_QUANTIFIERS_ASSIGN_ALL',
    });
    const originalValueRealized = periodsetting?.valueRealized;

    const FORM_DATA = {
      value: !originalValueRealized,
    };

    const response = await this.client
      .patch(
        `/api/admin/periodsettings/${
          period._id.toString() as string
        }/settings/${periodsetting?._id.toString() as string}/set`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body._id).to.equal(periodsetting?._id.toString());
    expect(response.body.valueRealized).to.equal(!originalValueRealized);
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

  it('404 response if period does not exist', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod();
    const periodsetting = await PeriodSettingsModel.findOne({
      period: period._id,
      key: 'PRAISE_QUANTIFIERS_ASSIGN_ALL',
    });
    const originalValueRealized = periodsetting?.valueRealized;

    const FORM_DATA = {
      value: !originalValueRealized,
    };

    return this.client
      .patch(
        `/api/admin/periodsettings/${faker.database.mongodbObjectId()}/settings/${
          periodsetting?._id.toString() as string
        }/set`
      )
      .send(FORM_DATA)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404);
  });

  it('404 response if periodsetting does not exist', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod();
    const periodsetting = await PeriodSettingsModel.findOne({
      period: period._id,
      key: 'PRAISE_QUANTIFIERS_ASSIGN_ALL',
    });
    const originalValueRealized = periodsetting?.valueRealized;

    const FORM_DATA = {
      value: !originalValueRealized,
    };

    return this.client
      .patch(
        `/api/admin/periodsettings/${
          period._id.toString() as string
        }/settings/${faker.database.mongodbObjectId()}/set`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(404);
  });

  it('400 response if missing value', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod();
    const periodsetting = await PeriodSettingsModel.findOne({
      period: period?._id,
      key: 'PRAISE_QUANTIFIERS_ASSIGN_ALL',
    });

    const FORM_DATA = {};

    return this.client
      .patch(
        `/api/admin/periodsettings/${
          period._id.toString() as string
        }/settings/${periodsetting?._id.toString() as string}/set`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('403 response if user is not ADMIN', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod();
    const periodsetting = await PeriodSettingsModel.findOne({
      period: period?._id,
      key: 'PRAISE_QUANTIFIERS_ASSIGN_ALL',
    });

    const FORM_DATA = {};

    return this.client
      .patch(
        `/api/admin/periodsettings/${
          period._id.toString() as string
        }/settings/${periodsetting?._id.toString() as string}/set`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(403);
  });

  it('401 response if user not authenticated', async function () {
    const period = await seedPeriod();
    const periodsetting = await PeriodSettingsModel.findOne({
      period: period._id,
      key: 'PRAISE_QUANTIFIERS_ASSIGN_ALL',
    });
    const originalValueRealized = periodsetting?.valueRealized;

    const FORM_DATA = {
      value: !originalValueRealized,
    };

    return this.client
      .patch(
        `/api/admin/periodsettings/${
          period._id.toString() as string
        }/settings/${periodsetting?._id.toString() as string}/set`
      )
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(401);
  });
});

describe('periodsetting.valueRealized conversions', () => {
  beforeEach(async () => {
    await PeriodModel.deleteMany({});
  });

  it('periodsetting.type "Integer" converted to integer number', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod();
    const setting = await seedPeriodSetting({
      period: period._id,
      type: 'Integer',
      value: 10,
    });

    const response = await this.client
      .get(
        `/api/periodsettings/${period?._id.toString() as string}/settings/${
          setting?._id.toString() as string
        }`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(typeof response.body.valueRealized).to.equal('number');
    expect(response.body.valueRealized % 1).to.equal(0);
  });

  it('periodsetting.type "Float" converted to float number', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod();
    const setting = await seedPeriodSetting({
      period: period._id,
      type: 'Float',
      value: 10.55,
    });

    const response = await this.client
      .get(
        `/api/periodsettings/${period?._id.toString() as string}/settings/${
          setting?._id.toString() as string
        }`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(typeof response.body.valueRealized).to.equal('number');
    expect(response.body.valueRealized % 1).to.be.greaterThan(0);
  });

  it('periodsetting.type "Boolean" converted to boolean', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod();
    const setting = await seedPeriodSetting({
      period: period._id,
      type: 'Boolean',
      value: false,
    });

    const response = await this.client
      .get(
        `/api/periodsettings/${period?._id.toString() as string}/settings/${
          setting?._id.toString() as string
        }`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(typeof response.body.valueRealized).to.equal('boolean');
    expect(response.body.valueRealized).to.equal(false);
  });

  it('periodsetting.type "IntegerList" converted to number[] of integers', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod();
    const setting = await seedPeriodSetting({
      period: period._id,
      type: 'IntegerList',
      value: '1, 2, 3',
    });

    const response = await this.client
      .get(
        `/api/periodsettings/${period?._id.toString() as string}/settings/${
          setting?._id.toString() as string
        }`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body.valueRealized)).to.be.true;
    expect(typeof response.body.valueRealized[0]).to.equal('number');
    expect(response.body.valueRealized[0] % 1).to.equal(0);
  });

  it('periodsetting.type "Image" converted to string uri', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod();
    const setting = await seedPeriodSetting({
      type: 'Image',
      value: 'file.png',
      period: period._id,
    });

    const response = await this.client
      .get(
        `/api/periodsettings/${period?._id.toString() as string}/settings/${
          setting?._id.toString() as string
        }`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(typeof response.body.valueRealized[0]).to.equal('string');
    expect(response.body.valueRealized).to.include(process.env.SERVER_URL);
    expect(response.body.valueRealized).to.include(setting.value);
    expect(() => new URL(response.body.valueRealized)).to.not.throw();
  });
});
