import { Wallet } from 'ethers';
import {
  seedPeriod,
  seedPraise,
  seedQuantification,
  seedUser,
  seedUserAccount,
} from '../pre-start/seed';
import { expect } from 'chai';
import { PeriodModel } from '@period/entities';
import { loginUser } from './utils';
import faker from 'faker';
import { PraiseModel } from '@praise/entities';

describe('GET /api/periods/all', () => {
  beforeEach(async () => {
    await PeriodModel.deleteMany({});
  });

  it('200 response with json body', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    return this.client
      .get(
        '/api/periods/all?page=1&limit=10&sortColumn=createdAt&sortType=desc'
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
  });

  it('401 response with json body if user not authenticated', function () {
    return this.client
      .get(
        '/api/periods/all?page=1&limit=10&sortColumn=createdAt&sortType=desc'
      )
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);
  });

  it('response body contains paginated list of periods', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({ ethereumAddress: wallet.address });

    // note: loginUser creates 1 UserEventLog
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod();
    const period2 = await seedPeriod({
      endDate: faker.date.future(1, period.endDate),
    });
    await seedPeriod({
      endDate: faker.date.future(1, period2.endDate),
    });

    const response = await this.client
      .get(
        '/api/periods/all?page=1&limit=10&sortColumn=createdAt&sortType=desc'
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).to.have.property('docs');
    expect(response.body.docs.length).equals(3);
    expect(response.body.docs[0]).to.have.any.keys(
      '_id',
      'name',
      'endDate',
      'status',
      'createdAt',
      'updatedAt'
    );
  });
});

describe('GET /api/period/:periodId', () => {
  beforeEach(async () => {
    await PeriodModel.deleteMany({});
  });

  it('200 response with json body containing a period', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod();

    const response = await this.client
      .get(`/api/periods/${period._id.toString() as string}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body._id).equals(period._id.toString());
  });

  it('401 response with json body if user not authenticated', async function () {
    const period = await seedPeriod();

    return this.client
      .get(`/api/periods/${period._id.toString() as string}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);
  });
});

describe('GET /api/period/:periodId/receiverPraise', () => {
  beforeEach(async () => {
    await PeriodModel.deleteMany({});
    await PraiseModel.deleteMany({});
  });

  it("200 response with json body containing a list of receiver's praise in a period", async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod();
    const userAccount = await seedUserAccount();
    await seedPraise({
      receiver: userAccount._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: userAccount._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: userAccount._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: userAccount._id,
      createdAt: faker.date.past(),
    });

    const response = await this.client
      .get(
        `/api/periods/${
          period._id.toString() as string
        }/receiverPraise?receiverId=${userAccount._id.toString() as string}`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).is.length(4);
    expect(response.body[0].receiver._id).to.equal(userAccount._id.toString());
  });

  it('400 response if missing receiverId', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod();
    const userAccount = await seedUserAccount();
    await seedPraise({
      receiver: userAccount._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: userAccount._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: userAccount._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: userAccount._id,
      createdAt: faker.date.past(),
    });

    return this.client
      .get(`/api/periods/${period._id.toString() as string}/receiverPraise`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect(400);
  });

  it('401 response if user not authenticated', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });

    const period = await seedPeriod();
    const userAccount = await seedUserAccount();
    await seedPraise({
      receiver: userAccount._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: userAccount._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: userAccount._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: userAccount._id,
      createdAt: faker.date.past(),
    });

    return this.client
      .get(
        `/api/periods/${period._id.toString() as string
        }/receiverPraise?receiverId=${userAccount._id.toString() as string}`
      )
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);
  });
});

describe('GET /api/period/:periodId/quantifierPraise', () => {
  beforeEach(async () => {
    await PeriodModel.deleteMany({});
    await PraiseModel.deleteMany({});
  });

  it("200 response with json body containing a list of quantifiers's praise in a period", async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod();
    const userAccount = await seedUserAccount();
    const praise = await seedPraise({
      receiver: userAccount._id,
      createdAt: faker.date.past(),
    });
    const praise2 = await seedPraise({
      receiver: userAccount._id,
      createdAt: faker.date.past(),
    });
    const praise3 = await seedPraise({
      receiver: userAccount._id,
      createdAt: faker.date.past(),
    });
    const praise4 = await seedPraise({
      receiver: userAccount._id,
      createdAt: faker.date.past(),
    });

    const quantifier = await seedUser();
    await seedQuantification(praise, quantifier, {
      dismissed: false,
      score: 10,
    });

    await seedQuantification(praise2, quantifier, {
      dismissed: false,
      score: 50,
    });

    await seedQuantification(praise3, quantifier, {
      dismissed: false,
      score: 70,
    });

    await seedQuantification(praise4, quantifier, {
      dismissed: false,
      score: 70,
    });

    const response = await this.client
      .get(
        `/api/periods/${
          period._id.toString() as string
        }/quantifierPraise?quantifierId=${quantifier._id.toString() as string}`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).is.length(4);
    expect(response.body[0].receiver._id).to.equal(userAccount._id.toString());
  });

  it('400 response if missing quantifier Id', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod();
    const userAccount = await seedUserAccount();
    await seedPraise({
      receiver: userAccount._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: userAccount._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: userAccount._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: userAccount._id,
      createdAt: faker.date.past(),
    });

    return this.client
      .get(`/api/periods/${period._id.toString() as string}/quantifierPraise`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect(400);
  });

  it('401 response if user not authenticated', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });

    const period = await seedPeriod();
    const userAccount = await seedUserAccount();
    await seedPraise({
      receiver: userAccount._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: userAccount._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: userAccount._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: userAccount._id,
      createdAt: faker.date.past(),
    });

    return this.client
      .get(
        `/api/periods/${period._id.toString() as string
        }/quantifierPraise?quantifierId=${userAccount._id.toString() as string}`
      )
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);
  });
});

describe('POST /api/admin/periods/create', () => {
  beforeEach(async () => {
    await PeriodModel.deleteMany({});
  });

  it('200 response with json body containing a new period', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const FORM_DATA = {
      name: faker.animal.type(),
      endDate: faker.date.future(),
    };

    const response = await this.client
      .post('/api/admin/periods/create')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(200);

    const period = await PeriodModel.findOne({ _id: response.body._id });

    expect(response.body.name).to.equal(FORM_DATA.name);
    expect(response.body.endDate).to.equal(FORM_DATA.endDate.toISOString());
    expect(period).to.exist;
  });

  it('400 response if missing name', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const FORM_DATA = {
      endDate: faker.date.future(),
    };

    return this.client
      .post('/api/admin/periods/create')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('400 response if missing endDate', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const FORM_DATA = {
      name: faker.animal.type(),
    };

    return this.client
      .post('/api/admin/periods/create')
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

    const FORM_DATA = {
      name: faker.animal.type(),
    };

    return this.client
      .post('/api/admin/periods/create')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(403);
  });

  it('401 response with json body if user not authenticated', async function () {
    const FORM_DATA = {
      name: faker.animal.type(),
      endDate: faker.date.future(),
    };

    return await this.client
      .post('/api/admin/periods/create')
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect(401);
  });
});

describe('PATCH /api/admin/periods/:periodId/update', () => {
  beforeEach(async () => {
    await PeriodModel.deleteMany({});
  });

  it('200 response with json body containing updated period', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod();

    const FORM_DATA = {
      name: faker.animal.cat(),
      endDate: faker.date.future(1, period.endDate),
    };

    const response = await this.client
      .patch(`/api/admin/periods/${period._id.toString() as string}/update`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.name).to.equal(FORM_DATA.name);
    expect(response.body.endDate).to.equal(FORM_DATA.endDate.toISOString());
    expect(response.body._id).to.equal(period._id.toString());
  });

  it('400 response if missing name and endDate', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod();

    const FORM_DATA = {};

    return this.client
      .patch(`/api/admin/periods/${period._id.toString() as string}/update`)
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

    const FORM_DATA = {
      name: faker.animal.cat(),
      endDate: faker.date.future(1, period.endDate),
    };

    return this.client
      .patch(`/api/admin/periods/${period._id.toString() as string}/update`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(403);
  });

  it('401 response with json body if user not authenticated', async function () {
    const period = await seedPeriod();

    const FORM_DATA = {
      name: faker.animal.cat(),
      endDate: faker.date.future(1, period.endDate),
    };

    return this.client
      .patch(`/api/admin/periods/${period._id.toString() as string}/update`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect(401);
  });
});

describe('PATCH /api/admin/periods/:periodId/close', () => {
  beforeEach(async () => {
    await PeriodModel.deleteMany({});
  });

  it('200 response with json body containing closed period', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod();

    const response = await this.client
      .patch(`/api/admin/periods/${period._id.toString() as string}/close`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.status).to.equal('CLOSED');
    expect(response.body._id).to.equal(period._id.toString());
  });

  it('400 response if period is already CLOSED', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod({ status: 'CLOSED' });

    return this.client
      .patch(`/api/admin/periods/${period._id.toString() as string}/close`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
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

    return this.client
      .patch(`/api/admin/periods/${period._id.toString() as string}/close`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(403);
  });

  it('401 response with json body if user not authenticated', async function () {
    const period = await seedPeriod();

    return this.client
      .patch(`/api/admin/periods/${period._id.toString() as string}/close`)
      .set('Accept', 'application/json')
      .expect(401);
  });
});
