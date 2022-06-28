import { Wallet } from 'ethers';
import {
  seedPeriod,
  seedPraise,
  seedQuantification,
  seedUser,
  seedUserAccount,
} from '@database/seeder/entities';
import { expect } from 'chai';
import { loginUser } from './utils';
import { PraiseModel } from '@praise/entities';
import { faker } from '@faker-js/faker';
import { PeriodModel } from '@period/entities';
import { PeriodSettingsModel } from '@periodsettings/entities';

describe('GET /api/praise/all', () => {
  beforeEach(async () => {
    await PraiseModel.deleteMany({});
  });

  it('200 response with json body containing paginated list of praises', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    await seedPraise();
    await seedPraise();
    await seedPraise();

    const response = await this.client
      .get('/api/praise/all?page=1&limit=10&sortColumn=createdAt&sortType=desc')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).to.have.property('docs');
    expect(response.body.docs.length).equals(3);
    expect(response.body.docs[0]).to.have.all.keys(
      '_id',
      'reasonRealized',
      'sourceId',
      'sourceName',
      'quantifications',
      'giver',
      'receiver',
      'createdAt',
      'updatedAt',
      'scoreRealized'
    );
  });

  it('200 response with json body containing paginated list of praises, filtered by reciever', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const receiver = await seedUserAccount();
    const receiver2 = await seedUserAccount();

    await seedPraise({ receiver: receiver._id });
    await seedPraise({ receiver: receiver._id });
    await seedPraise({ receiver: receiver._id });
    await seedPraise({ receiver: receiver2._id });

    const response = await this.client
      .get(
        `/api/praise/all?page=1&limit=10&sortColumn=createdAt&sortType=desc&receiver=${
          receiver._id.toString() as string
        }`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).to.have.property('docs');
    expect(response.body.docs.length).equals(3);
    expect(response.body.docs[0]).to.have.all.keys(
      '_id',
      'reasonRealized',
      'sourceId',
      'sourceName',
      'quantifications',
      'giver',
      'receiver',
      'createdAt',
      'updatedAt',
      'scoreRealized'
    );
    expect(
      response.body.docs.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (d: any) => d.receiver._id === receiver._id.toString()
      ).length
    )
      .to.equal(response.body.docs.length)
      .to.equal(3);
  });

  it('401 response with json body if user not authenticated', function () {
    return this.client
      .get('/api/praise/all?page=1&limit=10&sortColumn=createdAt&sortType=desc')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);
  });
});

describe('GET /api/praise/:id', () => {
  beforeEach(async () => {
    await PraiseModel.deleteMany({});
  });

  it('200 response with json body containing a praise', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const praise = await seedPraise();

    const response = await this.client
      .get(`/api/praise/${praise._id.toString() as string}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body._id).equals(praise._id.toString());
    expect(response.body).to.have.all.keys(
      '_id',
      'reasonRealized',
      'sourceId',
      'sourceName',
      'quantifications',
      'giver',
      'receiver',
      'createdAt',
      'updatedAt',
      'scoreRealized'
    );
  });

  it('401 response with json body if user not authenticated', async function () {
    const praise = await seedPraise();

    return this.client
      .get(`/api/praise/${praise._id.toString() as string}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);
  });

  it('praise may contain a forwarder', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const forwarder = await seedUserAccount();
    const praise = await seedPraise({ forwarder: forwarder._id });

    const response = await this.client
      .get(`/api/praise/${praise._id.toString() as string}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body._id).equals(praise._id.toString());
    expect(response.body).to.have.all.keys(
      '_id',
      'reasonRealized',
      'sourceId',
      'sourceName',
      'quantifications',
      'giver',
      'receiver',
      'createdAt',
      'updatedAt',
      'scoreRealized',
      'forwarder'
    );
  });
});

describe('PATCH /api/praise/:id/quantify', () => {
  beforeEach(async () => {
    await PeriodModel.deleteMany({});
    await PraiseModel.deleteMany({});
  });

  it('200 response with json body containing list with single praise with updated score', async function () {
    const wallet = Wallet.createRandom();
    const quantifier = await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'QUANTIFIER'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const praise = await seedPraise({ createdAt: new Date() });
    await seedQuantification(praise, quantifier, {
      score: 0,
      dismissed: false,
      duplicatePraise: undefined,
    });
    await seedPeriod({
      endDate: faker.date.future(),
      status: 'QUANTIFY',
    });

    const FORM_DATA = {
      score: 10,
    };

    const response = await this.client
      .patch(`/api/praise/${praise?._id.toString() as string}/quantify`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body[0]._id).to.equal(praise?._id.toString());
    expect(response.body[0].scoreRealized).to.equal(10);
    expect(response.body[0]).to.have.all.keys(
      '_id',
      'reasonRealized',
      'sourceId',
      'sourceName',
      'quantifications',
      'giver',
      'receiver',
      'createdAt',
      'updatedAt',
      'scoreRealized'
    );
  });

  it('200 response with json body containing list with single praise dismissed', async function () {
    const wallet = Wallet.createRandom();
    const quantifier = await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'QUANTIFIER'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const praise = await seedPraise({ createdAt: new Date() });
    await seedQuantification(praise, quantifier, {
      score: 0,
      dismissed: false,
      duplicatePraise: undefined,
    });
    await seedPeriod({
      endDate: faker.date.future(),
      status: 'QUANTIFY',
    });

    const FORM_DATA = {
      dismissed: true,
    };

    const response = await this.client
      .patch(`/api/praise/${praise?._id.toString() as string}/quantify`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body[0]._id).to.equal(praise?._id.toString());
    expect(response.body[0].quantifications[0].scoreRealized).to.equal(0);
    expect(response.body[0].quantifications[0].dismissed).to.be.true;
    expect(response.body[0]).to.have.all.keys(
      '_id',
      'reasonRealized',
      'sourceId',
      'sourceName',
      'quantifications',
      'giver',
      'receiver',
      'createdAt',
      'updatedAt',
      'scoreRealized'
    );
  });

  it('200 response with json body containing list with single praise marked duplicate', async function () {
    const wallet = Wallet.createRandom();
    const quantifier = await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'QUANTIFIER'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const praise = await seedPraise({ createdAt: new Date() });
    await seedQuantification(praise, quantifier, {
      score: 10,
      dismissed: false,
      duplicatePraise: undefined,
    });

    const praise2 = await seedPraise({ createdAt: new Date() });
    await seedQuantification(praise2, quantifier, {
      score: 0,
      dismissed: false,
      duplicatePraise: undefined,
    });
    await seedPeriod({
      endDate: faker.date.future(),
      status: 'QUANTIFY',
    });

    const FORM_DATA = {
      duplicatePraise: praise._id.toString(),
    };

    const response = await this.client
      .patch(`/api/praise/${praise2?._id.toString() as string}/quantify`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body[0]._id).to.equal(praise2?._id.toString());
    expect(response.body[0].quantifications[0].scoreRealized).to.equal(1);
    expect(response.body[0]).to.have.all.keys(
      '_id',
      'reasonRealized',
      'sourceId',
      'sourceName',
      'quantifications',
      'giver',
      'receiver',
      'createdAt',
      'updatedAt',
      'scoreRealized'
    );
  });

  it('200 response with json body containing list of updated praises', async function () {
    const wallet = Wallet.createRandom();
    const quantifier = await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'QUANTIFIER'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    // Original Praise
    const praise = await seedPraise({ createdAt: new Date() });
    await seedQuantification(praise, quantifier, {
      score: 10,
      dismissed: false,
      duplicatePraise: undefined,
    });

    // Duplicate praise
    const praise2 = await seedPraise({ createdAt: new Date() });
    await seedQuantification(praise2, quantifier, {
      score: 0,
      dismissed: false,
      duplicatePraise: praise._id,
    });

    const period = await seedPeriod({
      endDate: faker.date.future(),
      status: 'QUANTIFY',
    });
    await PeriodSettingsModel.updateOne(
      {
        period: period._id,
        key: 'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE',
      },
      { $set: { value: 0.1 } }
    );

    const FORM_DATA = {
      score: 20,
    };

    const response = await this.client
      .patch(`/api/praise/${praise?._id.toString() as string}/quantify`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body[0]._id).to.equal(praise?._id.toString());
    expect(response.body[0].quantifications[0].scoreRealized).to.equal(20);
    expect(response.body[0]).to.have.all.keys(
      '_id',
      'reasonRealized',
      'sourceId',
      'sourceName',
      'quantifications',
      'giver',
      'receiver',
      'createdAt',
      'updatedAt',
      'scoreRealized'
    );
    expect(response.body[1]._id).to.equal(praise2?._id.toString());
    expect(response.body[1].quantifications[0].scoreRealized).to.equal(2);
  });

  it('404 response if praise does not exist', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'QUANTIFIER'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const FORM_DATA = {
      score: 10,
    };

    return this.client
      .patch(`/api/praise/${faker.database.mongodbObjectId()}/quantify`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(404);
  });

  it('400 response if praise does not have associated period', async function () {
    const wallet = Wallet.createRandom();
    const quantifier = await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'QUANTIFIER'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const praise = await seedPraise({ createdAt: new Date() });
    await seedQuantification(praise, quantifier, {
      score: 0,
      dismissed: false,
      duplicatePraise: undefined,
    });

    const FORM_DATA = {
      score: 10,
    };

    return this.client
      .patch(`/api/praise/${praise?._id.toString() as string}/quantify`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('400 response if associated period status is not QUANTIFY', async function () {
    const wallet = Wallet.createRandom();
    const quantifier = await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'QUANTIFIER'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const praise = await seedPraise({ createdAt: new Date() });
    await seedQuantification(praise, quantifier, {
      score: 0,
      dismissed: false,
      duplicatePraise: undefined,
    });

    await seedPeriod({
      endDate: faker.date.future(),
      status: 'OPEN',
    });

    const FORM_DATA = {
      score: 10,
    };

    return this.client
      .patch(`/api/praise/${praise?._id.toString() as string}/quantify`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('400 response if user is not an assigned quantifier', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'QUANTIFIER'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const praise = await seedPraise({ createdAt: new Date() });

    await seedPeriod({
      endDate: faker.date.future(),
      status: 'QUANTIFY',
    });

    const FORM_DATA = {
      score: 10,
    };

    return this.client
      .patch(`/api/praise/${praise?._id.toString() as string}/quantify`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('400 response if praise marked duplicate of itself', async function () {
    const wallet = Wallet.createRandom();
    const quantifier = await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'QUANTIFIER'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const praise = await seedPraise({ createdAt: new Date() });
    await seedQuantification(praise, quantifier, {
      score: 0,
      dismissed: false,
      duplicatePraise: undefined,
    });
    await seedPeriod({
      endDate: faker.date.future(),
      status: 'QUANTIFY',
    });

    const FORM_DATA = {
      duplicatePraise: praise._id,
    };

    return this.client
      .patch(`/api/praise/${praise?._id.toString() as string}/quantify`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('400 response if praise marked duplicate of non-existant praise', async function () {
    const wallet = Wallet.createRandom();
    const quantifier = await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'QUANTIFIER'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const praise = await seedPraise({ createdAt: new Date() });
    await seedQuantification(praise, quantifier, {
      score: 0,
      dismissed: false,
      duplicatePraise: undefined,
    });
    await seedPeriod({
      endDate: faker.date.future(),
      status: 'QUANTIFY',
    });

    const FORM_DATA = {
      duplicatePraise: faker.database.mongodbObjectId(),
    };

    return await this.client
      .patch(`/api/praise/${praise?._id.toString() as string}/quantify`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('400 response if praise marked duplicate of another duplicate', async function () {
    const wallet = Wallet.createRandom();
    const quantifier = await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'QUANTIFIER'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const praise = await seedPraise({ createdAt: new Date() });
    await seedQuantification(praise, quantifier, {
      score: 0,
      dismissed: false,
      duplicatePraise: undefined,
    });

    const praise2 = await seedPraise({ createdAt: new Date() });
    await seedQuantification(praise, quantifier, {
      score: 0,
      dismissed: false,
      duplicatePraise: praise._id,
    });

    const praise3 = await seedPraise({ createdAt: new Date() });
    await seedQuantification(praise, quantifier, {
      score: 0,
      dismissed: false,
      duplicatePraise: praise2._id,
    });

    await seedPeriod({
      endDate: faker.date.future(),
      status: 'QUANTIFY',
    });

    const FORM_DATA = {
      duplicatePraise: praise3._id.toString(),
    };

    return this.client
      .patch(`/api/praise/${praise?._id.toString() as string}/quantify`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('403 response if user is not QUANTIFIER', async function () {
    const wallet = Wallet.createRandom();
    const quantifier = await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const praise = await seedPraise({ createdAt: new Date() });
    await seedQuantification(praise, quantifier, {
      score: 0,
      dismissed: false,
      duplicatePraise: undefined,
    });
    await seedPeriod({
      endDate: faker.date.future(),
      status: 'QUANTIFY',
    });

    const FORM_DATA = {
      score: 10,
    };

    return this.client
      .patch(`/api/praise/${praise?._id.toString() as string}/quantify`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(403);
  });

  it('401 response if user not authenticated', async function () {
    const wallet = Wallet.createRandom();
    const quantifier = await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'QUANTIFIER'],
    });

    const praise = await seedPraise({ createdAt: new Date() });
    await seedQuantification(praise, quantifier, {
      score: 0,
      dismissed: false,
      duplicatePraise: undefined,
    });
    await seedPeriod({
      endDate: faker.date.future(),
      status: 'QUANTIFY',
    });

    const FORM_DATA = {
      score: 10,
    };

    return this.client
      .patch(`/api/praise/${praise?._id.toString() as string}/quantify`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(401);
  });
});
