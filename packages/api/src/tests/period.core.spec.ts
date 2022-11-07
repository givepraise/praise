import { Wallet } from 'ethers';
import { expect } from 'chai';
import { faker } from '@faker-js/faker';
import { addDays } from 'date-fns';
import { PraiseModel } from '@/praise/entities';
import { PeriodModel } from '@/period/entities';
import {
  seedPeriod,
  seedPraise,
  seedQuantification,
  seedUser,
  seedUserAccount,
  seedUserAndUserAccount,
} from '@/database/seeder/entities';
import { PeriodSettingsModel } from '@/periodsettings/entities';
import { csvToJson, loginUser } from './utils';

describe('GET /api/periods/all', () => {
  beforeEach(async () => {
    await PeriodModel.deleteMany({});
  });

  it('200 response with json body', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      identityEthAddress: wallet.address,
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
    await seedUser({ identityEthAddress: wallet.address });

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
        '/api/periods/all?page=1&limit=10&sortColumn=createdAt&sortType=desc'
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).to.have.property('docs');
    expect(response.body.docs.length).equals(3);
    expect(response.body.docs[0]).to.have.all.keys(
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
      identityEthAddress: wallet.address,
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

describe('GET /api/period/:id/receiverPraise', () => {
  beforeEach(async () => {
    await PeriodModel.deleteMany({});
    await PraiseModel.deleteMany({});
  });

  it("200 response with json body containing a list of receiver's praise in a period", async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      identityEthAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod();
    const userAccount = await seedUserAccount();
    await seedUserAccount();

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
        `/api/periods/${period._id.toString() as string}/receiverPraise?id=${
          userAccount._id.toString() as string
        }`
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
      identityEthAddress: wallet.address,
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
      identityEthAddress: wallet.address,
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
        `/api/periods/${period._id.toString() as string}/receiverPraise?id=${
          userAccount._id.toString() as string
        }`
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
      identityEthAddress: wallet.address,
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
      identityEthAddress: wallet.address,
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
      identityEthAddress: wallet.address,
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
        `/api/periods/${
          period._id.toString() as string
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
      identityEthAddress: wallet.address,
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
      identityEthAddress: wallet.address,
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
      identityEthAddress: wallet.address,
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
      identityEthAddress: wallet.address,
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

  it('400 response if creating period less than 7 days after previous', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      identityEthAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const FORM_DATA = {
      name: faker.animal.type(),
      endDate: '2022-08-01T00:00:00.000Z',
    };

    await this.client
      .post('/api/admin/periods/create')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA);

    const FORM_DATA2 = {
      name: faker.animal.type(),
      endDate: '2022-08-04T00:00:00.000Z',
    };

    return this.client
      .post('/api/admin/periods/create')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA2)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('200 response if creating period more than 7 days after previous', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      identityEthAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const FORM_DATA = {
      name: faker.animal.type(),
      endDate: '2022-08-01T00:00:00.000Z',
    };

    await this.client
      .post('/api/admin/periods/create')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA);

    const FORM_DATA2 = {
      name: faker.animal.type(),
      endDate: '2022-08-09T00:00:00.000Z',
    };

    return this.client
      .post('/api/admin/periods/create')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA2)
      .expect('Content-Type', /json/)
      .expect(200);
  });
});

describe('PATCH /api/admin/periods/:periodId/update', () => {
  beforeEach(async () => {
    await PeriodModel.deleteMany({});
  });

  it('200 response with json body containing updated period', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      identityEthAddress: wallet.address,
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
      identityEthAddress: wallet.address,
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
      identityEthAddress: wallet.address,
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
      identityEthAddress: wallet.address,
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
      identityEthAddress: wallet.address,
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
      identityEthAddress: wallet.address,
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

describe('GET /api/admin/periods/:periodId/exportFull', () => {
  beforeEach(async () => {
    await PeriodModel.deleteMany({});
    await PraiseModel.deleteMany({});
    await PeriodSettingsModel.deleteMany({});
  });

  it('200 response with csv file body', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      identityEthAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const [receiverUser, receiverUserAccount] = await seedUserAndUserAccount();
    const [giverUser, giverUserAccount] = await seedUserAndUserAccount();

    await seedUserAccount();
    await seedUserAccount();

    // Create some praise
    const praise = await seedPraise({
      receiver: receiverUserAccount._id,
      giver: giverUserAccount._id,
      createdAt: new Date(),
    });
    const praise2 = await seedPraise({
      createdAt: addDays(praise.createdAt, 5),
    });
    const praise3 = await seedPraise({
      createdAt: addDays(praise2.createdAt, 5),
    });
    const praise4 = await seedPraise({
      createdAt: addDays(praise3.createdAt, 5),
    });

    // Create period containing all praise
    const period = await seedPeriod({
      endDate: addDays(praise4.createdAt, 10),
    });

    await PeriodSettingsModel.updateOne(
      {
        period: period._id,
        key: 'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER',
      },
      { $set: { value: 3 } }
    );

    // Quantify praise
    const [quantifier1User, quantifier1UserAccount] =
      await seedUserAndUserAccount();
    await seedQuantification(praise, quantifier1User, {
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

    const response = await this.client
      .get(`/api/admin/periods/${period._id.toString() as string}/exportFull`)
      .responseType('blob')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect('Content-Type', 'text/csv; charset=utf-8')
      .expect(200);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const responseJson: any[] = csvToJson(new String(response.body) as string);
    expect(responseJson[0]['id']).to.equal(
      praise._id.toString(),
      'Praise ids in row 1 do not match'
    );
    expect(responseJson[1]['id']).to.equal(
      praise2._id.toString(),
      'Praise ids in row 2 do not match'
    );
    expect(responseJson[2]['id']).to.equal(
      praise3._id.toString(),
      'Praise ids in row 3 do not match'
    );
    expect(responseJson[3]['id']).to.equal(
      praise4._id.toString(),
      'Praise ids in row 4 do not match'
    );

    expect(responseJson[0]['date']).to.equal(praise.createdAt.toISOString());

    expect(responseJson[0]['to user account id']).to.equal(
      receiverUserAccount._id.toString(),
      'Receiver user account ids do not match'
    );
    expect(responseJson[0]['to user account']).to.equal(
      receiverUserAccount.name
    );
    expect(responseJson[0]['to eth address']).to.equal(
      receiverUser.identityEthAddress
    );

    expect(responseJson[0]['from user account id']).to.equal(
      giverUserAccount._id.toString(),
      'Giver user account ids do not match'
    );
    expect(responseJson[0]['from user account']).to.equal(
      giverUserAccount.name
    );
    expect(responseJson[0]['from eth address']).to.equal(
      giverUser.identityEthAddress
    );

    expect(responseJson[0]['reason']).to.equal(praise.reasonRealized);

    expect(responseJson[0]['source id']).to.equal(praise.sourceId);
    expect(responseJson[0]['source name']).to.equal(praise.sourceName);

    expect(responseJson[0]['score 1']).to.equal('10');
    expect(responseJson[0]['score 2']).to.equal('30');
    expect(responseJson[0]['score 3']).to.equal('50');
    expect(responseJson[0]['avg score']).to.equal('30');

    expect(responseJson[0]['duplicate id 1']).to.equal('');
    expect(responseJson[0]['duplicate id 2']).to.equal('');
    expect(responseJson[0]['duplicate id 3']).to.equal('');

    expect(responseJson[0]['dismissed 1']).to.equal('false');
    expect(responseJson[0]['dismissed 2']).to.equal('false');
    expect(responseJson[0]['dismissed 3']).to.equal('false');

    expect(responseJson[0]['quantifier 1 username']).to.equal(
      quantifier1UserAccount.name
    );
    expect(responseJson[0]['quantifier 1 eth address']).to.equal(
      quantifier1User.identityEthAddress
    );
  });

  it('403 response if user is not ADMIN', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      identityEthAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod();
    await seedPraise();
    await seedPraise();
    await seedPraise();
    await seedPraise();

    return this.client
      .get(`/api/admin/periods/${period._id.toString() as string}/exportFull`)
      .responseType('blob')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });

  it('401 response if user not authenticated', async function () {
    const period = await seedPeriod();
    await seedPraise();
    await seedPraise();
    await seedPraise();
    await seedPraise();

    return this.client
      .get(`/api/admin/periods/${period._id.toString() as string}/exportFull`)
      .responseType('blob')
      .expect(401);
  });
});
