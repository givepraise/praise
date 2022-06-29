import { Wallet } from 'ethers';
import {
  seedPeriod,
  seedPraise,
  seedQuantification,
  seedUser,
  seedUserAccount,
} from '@database/seeder/entities';
import { expect } from 'chai';
import { PeriodModel } from '@period/entities';
import { loginUser } from './utils';
import { faker } from '@faker-js/faker';
import some from 'lodash/some';
import { PraiseModel } from '@praise/entities';
import { PeriodSettingsModel } from '@periodsettings/entities';
import { UserModel } from '@user/entities';
import { UserAccountModel } from '@useraccount/entities';

describe('PATCH /api/admin/periods/:periodId/assignQuantifiers', () => {
  beforeEach(async () => {
    await PeriodModel.deleteMany({});
    await PraiseModel.deleteMany({});
    await UserModel.deleteMany({});
    await UserAccountModel.deleteMany({});
    await PeriodSettingsModel.deleteMany({});
  });

  it('200 response with json body containing assignments with PRAISE_QUANTIFIERS_ASSIGN_ALL=false', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const receiver1 = await seedUserAccount();
    const receiver2 = await seedUserAccount();
    const receiver3 = await seedUserAccount();

    const receiversSorted = [receiver1, receiver2, receiver3].sort((a, b) =>
      a._id.toString().localeCompare(b._id.toString())
    );

    await seedPraise({
      receiver: receiver1._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: receiver1._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: receiver1._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: receiver1._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: receiver1._id,
      createdAt: faker.date.past(),
    });

    await seedPraise({
      receiver: receiver2._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: receiver2._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: receiver2._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: receiver2._id,
      createdAt: faker.date.past(),
    });

    await seedPraise({
      receiver: receiver3._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: receiver3._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: receiver3._id,
      createdAt: faker.date.past(),
    });

    const period = await seedPeriod();

    await PeriodSettingsModel.updateOne(
      {
        period: period._id,
        key: 'PRAISE_QUANTIFIERS_ASSIGN_ALL',
      },
      { $set: { value: false } }
    );

    await seedUser({
      roles: ['USER', 'QUANTIFIER'],
    });
    await seedUser({
      roles: ['USER', 'QUANTIFIER'],
    });
    await seedUser({
      roles: ['USER', 'QUANTIFIER'],
    });
    await seedUser({
      roles: ['USER', 'QUANTIFIER'],
    });

    const response = await this.client
      .patch(
        `/api/admin/periods/${
          period._id.toString() as string
        }/assignQuantifiers`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body._id).to.equal(period._id.toString());
    expect(response.body.status).to.equal('QUANTIFY');

    expect(response.body.receivers).to.have.length(3);
    expect(response.body.receivers[0]._id).to.equal(
      receiversSorted[0]._id.toString()
    );
    expect(response.body.receivers[0].praiseCount).to.equal(5);

    expect(response.body.receivers[1]._id).to.equal(
      receiversSorted[1]._id.toString()
    );
    expect(response.body.receivers[1].praiseCount).to.equal(4);

    expect(response.body.receivers[2]._id).to.equal(
      receiversSorted[2]._id.toString()
    );
    expect(response.body.receivers[2].praiseCount).to.equal(3);

    expect(response.body.quantifiers).to.have.length(3);
    expect(response.body.quantifiers[0].praiseCount).to.equal(12);
    expect(response.body.quantifiers[1].praiseCount).to.equal(12);
    expect(response.body.quantifiers[2].praiseCount).to.equal(12);

    expect(response.body.quantifiers[0].finishedCount).to.equal(0);
    expect(response.body.quantifiers[1].finishedCount).to.equal(0);
    expect(response.body.quantifiers[2].finishedCount).to.equal(0);
  });

  it('200 response with json body containing assignments with PRAISE_QUANTIFIERS_ASSIGN_ALL=true', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const receiver1 = await seedUserAccount();
    const receiver2 = await seedUserAccount();
    const receiver3 = await seedUserAccount();

    const receiversSorted = [receiver1, receiver2, receiver3].sort((a, b) =>
      a._id.toString().localeCompare(b._id.toString())
    );

    await seedPraise({
      receiver: receiver1._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: receiver1._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: receiver1._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: receiver1._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: receiver1._id,
      createdAt: faker.date.past(),
    });

    await seedPraise({
      receiver: receiver2._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: receiver2._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: receiver2._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: receiver2._id,
      createdAt: faker.date.past(),
    });

    await seedPraise({
      receiver: receiver3._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: receiver3._id,
      createdAt: faker.date.past(),
    });
    await seedPraise({
      receiver: receiver3._id,
      createdAt: faker.date.past(),
    });

    const period = await seedPeriod();

    await PeriodSettingsModel.updateOne(
      {
        period: period._id,
        key: 'PRAISE_QUANTIFIERS_ASSIGN_ALL',
      },
      { $set: { value: true } }
    );

    await seedUser({
      roles: ['USER', 'QUANTIFIER'],
    });
    await seedUser({
      roles: ['USER', 'QUANTIFIER'],
    });
    await seedUser({
      roles: ['USER', 'QUANTIFIER'],
    });
    await seedUser({
      roles: ['USER', 'QUANTIFIER'],
    });

    const response = await this.client
      .patch(
        `/api/admin/periods/${
          period._id.toString() as string
        }/assignQuantifiers`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body._id).to.equal(period._id.toString());
    expect(response.body.status).to.equal('QUANTIFY');

    expect(response.body.receivers).to.have.length(3);
    expect(response.body.receivers[0]._id).to.equal(
      receiversSorted[0]._id.toString()
    );
    expect(response.body.receivers[0].praiseCount).to.equal(5);

    expect(response.body.receivers[1]._id).to.equal(
      receiversSorted[1]._id.toString()
    );
    expect(response.body.receivers[1].praiseCount).to.equal(4);

    expect(response.body.receivers[2]._id).to.equal(
      receiversSorted[2]._id.toString()
    );
    expect(response.body.receivers[2].praiseCount).to.equal(3);

    expect(response.body.quantifiers).to.have.length(3);
    expect(response.body.quantifiers[0].praiseCount).to.equal(12);
    expect(response.body.quantifiers[1].praiseCount).to.equal(12);
    expect(response.body.quantifiers[2].praiseCount).to.equal(12);

    expect(response.body.quantifiers[0].finishedCount).to.equal(0);
    expect(response.body.quantifiers[1].finishedCount).to.equal(0);
    expect(response.body.quantifiers[2].finishedCount).to.equal(0);
  });

  it('404 response if periodId does not exist', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    return this.client
      .patch(
        `/api/admin/periods/${faker.database.mongodbObjectId()}/assignQuantifiers`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect(404);
  });

  it('400 response if period is not OPEN', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod({ status: 'QUANTIFY' });

    return this.client
      .patch(
        `/api/admin/periods/${
          period._id.toString() as string
        }/assignQuantifiers`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect(400);
  });

  it('400 response if praise has already been assigned for the period', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod({ status: 'QUANTIFY' });

    await this.client
      .patch(
        `/api/admin/periods/${
          period._id.toString() as string
        }/assignQuantifiers`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json');

    return this.client
      .patch(
        `/api/admin/periods/${
          period._id.toString() as string
        }/assignQuantifiers`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
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
      .patch(
        `/api/admin/periods/${
          period._id.toString() as string
        }/assignQuantifiers`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(403);
  });

  it('401 response with json body if user not authenticated', async function () {
    const period = await seedPeriod();

    return this.client
      .patch(
        `/api/admin/periods/${
          period._id.toString() as string
        }/assignQuantifiers`
      )
      .expect(401);
  });
});

describe('PATCH /api/admin/periods/:periodId/replaceQuantifier', () => {
  beforeEach(async () => {
    await PeriodModel.deleteMany({});
    await PraiseModel.deleteMany({});
    await PeriodSettingsModel.deleteMany({});
  });

  it('200 response with json body containing period and affected praises', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const receiver1 = await seedUserAccount();
    const praise1 = await seedPraise({
      receiver: receiver1._id,
      createdAt: faker.date.past(),
    });
    const praise2 = await seedPraise({
      receiver: receiver1._id,
      createdAt: faker.date.past(),
    });
    const praise3 = await seedPraise({
      receiver: receiver1._id,
      createdAt: faker.date.past(),
    });
    const period = await seedPeriod({
      status: 'QUANTIFY',
    });

    const originalQuantifier = await seedUser({
      roles: ['USER', 'QUANTIFIER'],
    });
    const newQuantifier = await seedUser({
      roles: ['USER', 'QUANTIFIER'],
    });

    await seedQuantification(praise1, originalQuantifier);
    await seedQuantification(praise2, originalQuantifier);
    await seedQuantification(praise3, originalQuantifier);

    const FORM_DATA = {
      currentQuantifierId: originalQuantifier._id.toString(),
      newQuantifierId: newQuantifier._id.toString(),
    };

    const response = await this.client
      .patch(
        `/api/admin/periods/${
          period._id.toString() as string
        }/replaceQuantifier`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.period._id).to.equal(period._id.toString());
    expect(response.body.period.quantifiers).to.have.length(1);
    expect(response.body.period.quantifiers[0]._id).to.equal(
      newQuantifier._id.toString()
    );
    expect(response.body.period.quantifiers[0].finishedCount).to.equal(0);

    expect(response.body.praises.length).to.equal(3);
    expect(
      some(response.body.praises[0].quantifications, {
        quantifier: newQuantifier._id.toString(),
      })
    ).to.be.true;
    expect(
      some(response.body.praises[1].quantifications, {
        quantifier: newQuantifier._id.toString(),
      })
    ).to.be.true;
    expect(
      some(response.body.praises[2].quantifications, {
        quantifier: newQuantifier._id.toString(),
      })
    ).to.be.true;

    expect(
      some(response.body.praises[0].quantifications, {
        quantifier: originalQuantifier._id.toString(),
      })
    ).to.be.false;
    expect(
      some(response.body.praises[1].quantifications, {
        quantifier: originalQuantifier._id.toString(),
      })
    ).to.be.false;
    expect(
      some(response.body.praises[2].quantifications, {
        quantifier: originalQuantifier._id.toString(),
      })
    ).to.be.false;
  });

  it('404 response if periodId does not exist', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const originalQuantifier = await seedUser({
      roles: ['USER', 'QUANTIFIER'],
    });
    const newQuantifier = await seedUser({
      roles: ['USER', 'QUANTIFIER'],
    });

    const FORM_DATA = {
      currentQuantifierId: originalQuantifier._id.toString(),
      newQuantifierId: newQuantifier._id.toString(),
    };

    return this.client
      .patch(
        `/api/admin/periods/${faker.database.mongodbObjectId()}/replaceQuantifier`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(404);
  });

  it('400 response if period is not QUANTIFY', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod({ status: 'OPEN' });
    const originalQuantifier = await seedUser({
      roles: ['USER', 'QUANTIFIER'],
    });
    const newQuantifier = await seedUser({
      roles: ['USER', 'QUANTIFIER'],
    });

    const FORM_DATA = {
      currentQuantifierId: originalQuantifier._id.toString(),
      newQuantifierId: newQuantifier._id.toString(),
    };

    return this.client
      .patch(
        `/api/admin/periods/${
          period._id.toString() as string
        }/replaceQuantifier`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('400 response if missing currentQuantifierId', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod({ status: 'OPEN' });
    const newQuantifier = await seedUser({
      roles: ['USER', 'QUANTIFIER'],
    });

    const FORM_DATA = {
      newQuantifierId: newQuantifier._id.toString(),
    };

    return this.client
      .patch(
        `/api/admin/periods/${
          period._id.toString() as string
        }/replaceQuantifier`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('400 response if missing newQuantifierId', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod({ status: 'OPEN' });
    const originalQuantifier = await seedUser({
      roles: ['USER', 'QUANTIFIER'],
    });

    const FORM_DATA = {
      currentQuantifierId: originalQuantifier._id.toString(),
    };

    return this.client
      .patch(
        `/api/admin/periods/${
          period._id.toString() as string
        }/replaceQuantifier`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('400 response currentQuantifierId is same as newQuantifierId', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod({ status: 'OPEN' });
    const originalQuantifier = await seedUser({
      roles: ['USER', 'QUANTIFIER'],
    });

    const FORM_DATA = {
      currentQuantifierId: originalQuantifier._id.toString(),
      newQuantifierId: originalQuantifier._id.toString(),
    };

    return this.client
      .patch(
        `/api/admin/periods/${
          period._id.toString() as string
        }/replaceQuantifier`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('400 response if original user does not exist', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod({ status: 'OPEN' });
    const newQuantifier = await seedUser({
      roles: ['USER', 'QUANTIFIER'],
    });

    const FORM_DATA = {
      currentQuantifierId: faker.database.mongodbObjectId(),
      newQuantifierId: newQuantifier._id.toString(),
    };

    return this.client
      .patch(
        `/api/admin/periods/${
          period._id.toString() as string
        }/replaceQuantifier`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('400 response if replacement user does not exist', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod({ status: 'OPEN' });
    const originalQuantifier = await seedUser({
      roles: ['USER', 'QUANTIFIER'],
    });

    const FORM_DATA = {
      currentQuantifierId: originalQuantifier._id.toString(),
      newQuantifierId: faker.database.mongodbObjectId(),
    };

    return this.client
      .patch(
        `/api/admin/periods/${
          period._id.toString() as string
        }/replaceQuantifier`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('400 response if replacement user is not a QUANTIFIER', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod({ status: 'OPEN' });
    const originalQuantifier = await seedUser({
      roles: ['USER', 'QUANTIFIER'],
    });
    const newQuantifier = await seedUser({
      roles: ['USER'],
    });

    const FORM_DATA = {
      currentQuantifierId: originalQuantifier._id.toString(),
      newQuantifierId: newQuantifier._id.toString(),
    };

    return this.client
      .patch(
        `/api/admin/periods/${
          period._id.toString() as string
        }/replaceQuantifier`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('400 response if replacement user is already assigned to some of the same praise as original', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const period = await seedPeriod({ status: 'OPEN' });
    const originalQuantifier = await seedUser({
      roles: ['USER', 'QUANTIFIER'],
    });
    const newQuantifier = await seedUser({
      roles: ['USER', 'QUANTIFIER'],
    });

    const receiver1 = await seedUserAccount();
    const praise1 = await seedPraise({
      receiver: receiver1._id,
      createdAt: faker.date.past(),
    });
    const praise2 = await seedPraise({
      receiver: receiver1._id,
      createdAt: faker.date.past(),
    });
    const praise3 = await seedPraise({
      receiver: receiver1._id,
      createdAt: faker.date.past(),
    });

    await seedQuantification(praise1, originalQuantifier);
    await seedQuantification(praise2, originalQuantifier);
    await seedQuantification(praise3, originalQuantifier);

    await seedQuantification(praise1, newQuantifier);

    const FORM_DATA = {
      currentQuantifierId: originalQuantifier._id.toString(),
      newQuantifierId: newQuantifier._id.toString(),
    };

    return this.client
      .patch(
        `/api/admin/periods/${
          period._id.toString() as string
        }/replaceQuantifier`
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

    const period = await seedPeriod({ status: 'OPEN' });
    const originalQuantifier = await seedUser({
      roles: ['USER', 'QUANTIFIER'],
    });
    const newQuantifier = await seedUser({
      roles: ['USER', 'QUANTIFIER'],
    });

    const FORM_DATA = {
      currentQuantifierId: originalQuantifier._id.toString(),
      newQuantifierId: newQuantifier._id.toString(),
    };

    return this.client
      .patch(
        `/api/admin/periods/${
          period._id.toString() as string
        }/replaceQuantifier`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(403);
  });

  it('401 response if user is not authenticated', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });

    const period = await seedPeriod({ status: 'OPEN' });
    const originalQuantifier = await seedUser({
      roles: ['USER', 'QUANTIFIER'],
    });
    const newQuantifier = await seedUser({
      roles: ['USER', 'QUANTIFIER'],
    });

    const FORM_DATA = {
      currentQuantifierId: originalQuantifier._id.toString(),
      newQuantifierId: newQuantifier._id.toString(),
    };

    return this.client
      .patch(
        `/api/admin/periods/${
          period._id.toString() as string
        }/replaceQuantifier`
      )
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(401);
  });
});
