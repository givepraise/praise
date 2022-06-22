import { Wallet } from 'ethers';
import { seedSetting, seedUser } from '../pre-start/seed';
import { expect } from 'chai';
import { loginUser } from './utils';
import { faker } from '@faker-js/faker';
import { SettingsModel } from '@settings/entities';
import { URL } from 'url';

describe('GET /api/settings/all', () => {
  it('200 response with json body containing list of settings', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const settings = await SettingsModel.find();

    const response = await this.client
      .get('/api/settings/all')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.length).equals(settings.length);
    expect(response.body[0]).to.have.all.keys(
      '_id',
      'key',
      'label',
      'type',
      'group',
      'description',
      'value',
      'valueRealized'
    );
  });

  it('401 response if user not authenticated', function () {
    return this.client
      .get('/api/settings/all')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);
  });
});

describe('GET /api/settings/:id', () => {
  it('200 response with json body containing a setting', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const setting = await seedSetting();

    const response = await this.client
      .get(`/api/settings/${setting?._id.toString() as string}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body._id).to.equal(setting?._id.toString());
    expect(response.body).to.have.all.keys(
      '_id',
      'key',
      'label',
      'type',
      'group',
      'description',
      'value',
      'valueRealized'
    );
  });

  it('404 response if setting key does not exist', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    return this.client
      .get(`/api/settings/${faker.database.mongodbObjectId()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect(404);
  });

  it('401 response if user not authenticated', async function () {
    const setting = await SettingsModel.findOne({
      key: 'PRAISE_QUANTIFIERS_ASSIGN_ALL',
    });

    return this.client
      .get(`/api/settings/${setting?._id as string}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);
  });
});

describe('PATCH /api/admin/settings/:id/set', () => {
  it('200 response with json body containing updated period', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const setting = await SettingsModel.findOne({
      key: 'PRAISE_QUANTIFIERS_ASSIGN_ALL',
    });
    const originalValueRealized = setting?.valueRealized;

    const FORM_DATA = {
      value: !originalValueRealized,
    };

    const response = await this.client
      .patch(`/api/admin/settings/${setting?._id.toString() as string}/set`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body._id).to.equal(setting?._id.toString());
    expect(response.body.valueRealized).to.equal(!originalValueRealized);
    expect(response.body).to.have.all.keys(
      '_id',
      'key',
      'value',
      'valueRealized',
      'type',
      'label',
      'description',
      'group'
    );
  });

  it('404 response if setting does not exist', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const setting = await SettingsModel.findOne({
      key: 'PRAISE_QUANTIFIERS_ASSIGN_ALL',
    });
    const originalValueRealized = setting?.valueRealized;

    const FORM_DATA = {
      value: !originalValueRealized,
    };

    return this.client
      .patch(`/api/admin/settings/${faker.database.mongodbObjectId()}/set`)
      .send(FORM_DATA)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
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

    const setting = await SettingsModel.findOne({
      key: 'PRAISE_QUANTIFIERS_ASSIGN_ALL',
    });
    const FORM_DATA = {};

    return this.client
      .patch(`/api/admin/settings/${setting?._id.toString() as string}/set`)
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

    const setting = await SettingsModel.findOne({
      key: 'PRAISE_QUANTIFIERS_ASSIGN_ALL',
    });
    const originalValueRealized = setting?.valueRealized;

    const FORM_DATA = {
      value: !originalValueRealized,
    };

    return this.client
      .patch(`/api/admin/settings/${faker.database.mongodbObjectId()}/set`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(403);
  });

  it('401 response if user not authenticated', async function () {
    const setting = await SettingsModel.findOne({
      key: 'PRAISE_QUANTIFIERS_ASSIGN_ALL',
    });
    const originalValueRealized = setting?.valueRealized;

    const FORM_DATA = {
      value: !originalValueRealized,
    };

    return this.client
      .patch(`/api/admin/settings/${setting?._id.toString() as string}}/set`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(401);
  });
});

describe('setting.valueRealized conversions', () => {
  it('setting.type "Integer" converted to integer number', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const setting = await seedSetting({
      type: 'Integer',
      value: 10,
    });

    const response = await this.client
      .get(`/api/settings/${setting?._id.toString() as string}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(typeof response.body.valueRealized).to.equal('number');
    expect(response.body.valueRealized % 1).to.equal(0);
  });

  it('setting.type "Float" converted to float number', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const setting = await seedSetting({
      type: 'Float',
      value: 10.55,
    });

    const response = await this.client
      .get(`/api/settings/${setting?._id.toString() as string}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(typeof response.body.valueRealized).to.equal('number');
    expect(response.body.valueRealized % 1).to.be.greaterThan(0);
  });

  it('setting.type "Boolean" converted to boolean', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const setting = await seedSetting({
      type: 'Boolean',
      value: false,
    });

    const response = await this.client
      .get(`/api/settings/${setting?._id.toString() as string}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(typeof response.body.valueRealized).to.equal('boolean');
    expect(response.body.valueRealized).to.equal(false);
  });

  it('setting.type "IntegerList" converted to number[] of integers', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const setting = await seedSetting({
      type: 'IntegerList',
      value: '1, 2, 3',
    });

    const response = await this.client
      .get(`/api/settings/${setting?._id.toString() as string}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body.valueRealized)).to.be.true;
    expect(typeof response.body.valueRealized[0]).to.equal('number');
    expect(response.body.valueRealized[0] % 1).to.equal(0);
  });

  it('setting.type "Image" converted to string uri', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const setting = await seedSetting({
      type: 'Image',
      value: 'file.png',
    });

    const response = await this.client
      .get(`/api/settings/${setting?._id.toString() as string}`)
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
