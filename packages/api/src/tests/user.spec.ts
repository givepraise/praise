import { expect } from 'chai';
import { Wallet } from 'ethers';
import { faker } from '@faker-js/faker';
import some from 'lodash/some';
import { UserModel } from '@user/entities';
import { UserAccountModel } from '@useraccount/entities';
import {
  seedPeriod,
  seedPraise,
  seedQuantification,
  seedUser,
  seedUserAccount,
  seedUserAndUserAccount,
} from '@database/seeder/entities';
import { PraiseModel } from '@praise/entities';
import { PeriodModel } from '@period/entities';
import { loginUser } from './utils';

describe('GET /api/users/all', () => {
  beforeEach(async () => {
    await UserModel.deleteMany({});
    await UserAccountModel.deleteMany({});
  });

  it('200 response with json body containing list of users with useraccounts', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    await seedUserAndUserAccount();
    await seedUserAndUserAccount();
    await seedUserAndUserAccount();

    const response = await this.client
      .get('/api/users/all')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.length).equals(4);
    expect(response.body[0].accounts.length).to.equal(0);
    expect(response.body[1].accounts.length).to.equal(1);
    expect(response.body[0]).to.have.all.keys(
      '_id',
      'roles',
      'accounts',
      'nameRealized',
      'createdAt',
      'updatedAt'
    );
  });

  it('401 response with json body if user not authenticated', function () {
    return this.client
      .get('/api/users/all')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);
  });
});

describe('GET /api/users/:id', () => {
  beforeEach(async () => {
    await UserModel.deleteMany({});
    await UserAccountModel.deleteMany({});
  });

  it('200 response with json body containing the user with useraccount', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const [user, useraccount] = await seedUserAndUserAccount();

    const response = await this.client
      .get(`/api/users/${user?._id.toString() as string}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.accounts[0]._id).to.equal(useraccount._id.toString());
    expect(response.body).to.have.all.keys(
      '_id',
      'roles',
      'accounts',
      'nameRealized',
      'createdAt',
      'updatedAt'
    );
  });

  it('200 response containing user with multiple useraccounts', async function () {
    const wallet = Wallet.createRandom();
    await seedUserAndUserAccount({
      ethereumAddress: wallet.address,
      roles: ['USER'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const user = await seedUser();

    const useraccount = await seedUserAccount({ user: user._id });
    const useraccount2 = await seedUserAccount({ user: user._id });
    const useraccount3 = await seedUserAccount({ user: user._id });

    const response = await this.client
      .get(`/api/users/${user?._id.toString() as string}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(some(response.body.accounts, { _id: useraccount._id.toString() })).to
      .be.true;
    expect(some(response.body.accounts, { _id: useraccount2._id.toString() }))
      .to.be.true;
    expect(some(response.body.accounts, { _id: useraccount3._id.toString() }))
      .to.be.true;
    expect(response.body).to.have.all.keys(
      '_id',
      'roles',
      'accounts',
      'nameRealized',
      'createdAt',
      'updatedAt'
    );
  });

  it('200 response containing user with ethereumAddress is requesting user is ADMIN', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const [user, useraccount] = await seedUserAndUserAccount();

    const response = await this.client
      .get(`/api/users/${user?._id.toString() as string}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.accounts[0]._id).to.equal(useraccount._id.toString());
    expect(response.body).to.have.all.keys(
      '_id',
      'roles',
      'accounts',
      'nameRealized',
      'ethereumAddress',
      'createdAt',
      'updatedAt'
    );
  });

  it('200 response containing user without useraccount, if user does not have any', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const user = await seedUser();

    const response = await this.client
      .get(`/api/users/${user?._id.toString() as string}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.accounts.length).to.equal(0);
    expect(response.body).to.have.all.keys(
      '_id',
      'roles',
      'accounts',
      'nameRealized',
      'createdAt',
      'updatedAt'
    );
  });

  it('404 response if user does not exist', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    return this.client
      .get(`/api/users/${faker.database.mongodbObjectId()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404);
  });

  it('401 response if user not authenticated', async function () {
    const [user] = await seedUserAndUserAccount();

    return this.client
      .get(`/api/users/${user?._id.toString() as string}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);
  });
});

describe('PATCH /api/admin/users/:id/addRole', () => {
  beforeEach(async () => {
    await UserModel.deleteMany({});
    await UserAccountModel.deleteMany({});
  });

  it('200 response with json body containing the updated user', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const user = await seedUser({ roles: ['USER'] });

    const FORM_DATA = {
      role: 'ADMIN',
    };

    const response = await this.client
      .patch(`/api/admin/users/${user?._id.toString() as string}/addRole`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.roles).to.include('ADMIN');
    expect(response.body).to.have.all.keys(
      '_id',
      'roles',
      'accounts',
      'nameRealized',
      'ethereumAddress',
      'createdAt',
      'updatedAt'
    );
  });

  it('200 response logs out updated user', async function () {
    const wallet = Wallet.createRandom();
    const user = await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const FORM_DATA = {
      role: 'QUANTIFIER',
    };

    await this.client
      .patch(`/api/admin/users/${user?._id.toString() as string}/addRole`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(200);

    return this.client
      .patch(`/api/admin/users/${user?._id.toString() as string}/addRole`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(401);
  });

  it('404 response if user does not exist', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const FORM_DATA = {
      role: 'ADMIN',
    };

    return this.client
      .patch(`/api/admin/users/${faker.database.mongodbObjectId()}/addRole`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(404);
  });

  it('400 response if role does not exist', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const user = await seedUser({ roles: ['USER'] });

    const FORM_DATA = {
      role: faker.random.alphaNumeric(25),
    };

    return this.client
      .patch(`/api/admin/users/${user?._id.toString() as string}/addRole`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('400 response if missing role parameter', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const user = await seedUser({ roles: ['USER'] });

    const FORM_DATA = {};

    return this.client
      .patch(`/api/admin/users/${user?._id.toString() as string}/addRole`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('400 response if user already has new role', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const user = await seedUser({ roles: ['USER'] });

    const FORM_DATA = {
      role: 'USER',
    };

    return this.client
      .patch(`/api/admin/users/${user?._id.toString() as string}/addRole`)
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

    const user = await seedUser({ roles: ['USER'] });

    const FORM_DATA = {
      role: 'ADMIN',
    };

    return this.client
      .patch(`/api/admin/users/${user?._id.toString() as string}/addRole`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(403);
  });

  it('401 response if user not authenticated', async function () {
    const user = await seedUser({ roles: ['USER'] });

    const FORM_DATA = {
      role: 'ADMIN',
    };

    return this.client
      .patch(`/api/admin/users/${user?._id.toString() as string}/addRole`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(401);
  });
});

describe('PATCH /api/admin/users/:id/removeRole', () => {
  beforeEach(async () => {
    await UserModel.deleteMany({});
    await UserAccountModel.deleteMany({});
    await PeriodModel.deleteMany({});
    await PraiseModel.deleteMany({});
  });

  it('200 response with json body containing the updated user', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const user = await seedUser({ roles: ['USER', 'ADMIN'] });

    const FORM_DATA = {
      role: 'ADMIN',
    };

    const response = await this.client
      .patch(`/api/admin/users/${user?._id.toString() as string}/removeRole`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.roles).to.not.include('ADMIN');
    expect(response.body).to.have.all.keys(
      '_id',
      'roles',
      'accounts',
      'nameRealized',
      'ethereumAddress',
      'createdAt',
      'updatedAt'
    );
  });

  it('200 response logs out updated user', async function () {
    const wallet = Wallet.createRandom();
    const user = await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN', 'QUANTIFIER'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const FORM_DATA = {
      role: 'QUANTIFIER',
    };

    await this.client
      .patch(`/api/admin/users/${user?._id.toString() as string}/removeRole`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(200);

    return this.client
      .patch(`/api/admin/users/${user?._id.toString() as string}/removeRole`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(401);
  });

  it('404 response if user does not exist', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const FORM_DATA = {
      role: 'ADMIN',
    };

    return this.client
      .patch(`/api/admin/users/${faker.database.mongodbObjectId()}/removeRole`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(404);
  });

  it('400 response if role does not exist', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const user = await seedUser({ roles: ['USER', 'ADMIN'] });

    const FORM_DATA = {
      role: faker.random.alphaNumeric(25),
    };

    return this.client
      .patch(`/api/admin/users/${user?._id.toString() as string}/removeRole`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('400 response if missing role parameter', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const user = await seedUser({ roles: ['USER', 'ADMIN'] });

    const FORM_DATA = {};

    return this.client
      .patch(`/api/admin/users/${user?._id.toString() as string}/addRole`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('400 response if user does not have role', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const user = await seedUser({ roles: ['USER', 'ADMIN'] });

    const FORM_DATA = {
      role: 'QUANTIFIER',
    };

    return this.client
      .patch(`/api/admin/users/${user?._id.toString() as string}/removeRole`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('400 response if removing ADMIN role from only ADMIN', async function () {
    const wallet = Wallet.createRandom();
    const user = await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const FORM_DATA = {
      role: 'ADMIN',
    };

    return this.client
      .patch(`/api/admin/users/${user?._id.toString() as string}/removeRole`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('400 response if removing QUANTIFIER role from actively assigned quantifier', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
      roles: ['USER', 'ADMIN'],
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const quantifier = await seedUser({ roles: ['USER', 'QUANTIFIER'] });

    const praise = await seedPraise({
      createdAt: faker.date.past(),
    });
    await seedQuantification(praise, quantifier, {
      dismissed: false,
      score: 0,
    });
    await seedPeriod({ status: 'QUANTIFY' });

    const FORM_DATA = {
      role: 'QUANTIFIER',
    };

    return this.client
      .patch(
        `/api/admin/users/${quantifier?._id.toString() as string}/removeRole`
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

    const user = await seedUser({ roles: ['USER', 'ADMIN'] });

    const FORM_DATA = {
      role: 'ADMIN',
    };

    return this.client
      .patch(`/api/admin/users/${user?._id.toString() as string}/removeRole`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(403);
  });

  it('401 response if user not authenticated', async function () {
    const user = await seedUser({ roles: ['USER', 'ADMIN'] });

    const FORM_DATA = {
      role: 'ADMIN',
    };

    return this.client
      .patch(`/api/admin/users/${user?._id.toString() as string}/removeRole`)
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect('Content-Type', /json/)
      .expect(401);
  });
});
