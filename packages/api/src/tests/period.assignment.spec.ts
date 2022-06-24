import { Wallet } from 'ethers';
import {
  seedPeriod,
  seedPraise,
  seedUser,
  seedUserAccount,
} from '@database/seeder/entities';
import { expect } from 'chai';
import { PeriodModel } from '@period/entities';
import { loginUser } from './utils';
import { faker } from '@faker-js/faker';
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
        `/api/admin/periods/${period._id.toString() as string
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
        `/api/admin/periods/${period._id.toString() as string
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
        `/api/admin/periods/${period._id.toString() as string
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
        `/api/admin/periods/${period._id.toString() as string
        }/assignQuantifiers`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json');

    return this.client
      .patch(
        `/api/admin/periods/${period._id.toString() as string
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
        `/api/admin/periods/${period._id.toString() as string
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
        `/api/admin/periods/${period._id.toString() as string
        }/assignQuantifiers`
      )
      .expect(401);
  });
});
