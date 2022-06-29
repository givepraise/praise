import { Wallet } from 'ethers';
import { expect } from 'chai';
import { faker } from '@faker-js/faker';
import {
  seedUser,
  seedUserAccount,
  seedUserAndUserAccount,
} from '@database/seeder/entities';
import { UserAccountModel } from '@useraccount/entities';

describe('GET /api/activate', () => {
  it('200 response with user', async function () {
    const wallet = Wallet.createRandom();
    const accountId = faker.datatype.uuid();
    const activateToken = faker.datatype.uuid();

    const user = await seedUser({ ethereumAddress: wallet.address });
    const userAccount = await seedUserAccount({ accountId, activateToken });

    const message =
      'SIGN THIS MESSAGE TO ACTIVATE YOUR ACCOUNT.\n\n' +
      `ACCOUNT ID:\n${accountId}\n\n` +
      `ADDRESS:\n${wallet.address}\n\n` +
      `TOKEN:\n${activateToken}`;

    const signature = await wallet.signMessage(message);

    const FORM_DATA = {
      ethereumAddress: wallet.address,
      signature,
      accountId,
    };

    const response = await this.client
      .post('/api/activate')
      .set('Accept', 'application/json')
      .send(FORM_DATA);

    const userAccountRefreshed = await UserAccountModel.findOne({
      _id: userAccount._id,
    });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('_id');
    expect(response.body._id).to.equal(user._id.toString());
    expect(userAccountRefreshed?.user).to.exist;
    expect(userAccountRefreshed?.user?.toString()).to.equal(
      user._id.toString()
    );
    expect(userAccountRefreshed?.activateToken).to.be.undefined;
  });

  it('400 response when missing signature', async function () {
    const wallet = Wallet.createRandom();
    const accountId = faker.datatype.uuid();
    const activateToken = faker.datatype.uuid();

    await seedUserAndUserAccount(
      { ethereumAddress: wallet.address },
      { accountId, activateToken }
    );

    const message =
      'SIGN THIS MESSAGE TO ACTIVATE YOUR ACCOUNT.\n\n' +
      `ACCOUNT ID:\n${accountId}\n\n` +
      `ADDRESS:\n${wallet.address}\n\n` +
      `TOKEN:\n${activateToken}`;

    await wallet.signMessage(message);

    const FORM_DATA = {
      ethereumAddress: wallet.address,
      accountId,
    };

    const response = await this.client
      .post('/api/activate')
      .set('Accept', 'application/json')
      .send(FORM_DATA);

    expect(response.status).to.equal(400);
  });

  it('400 response when missing ethereumAddress', async function () {
    const wallet = Wallet.createRandom();
    const accountId = faker.datatype.uuid();
    const activateToken = faker.datatype.uuid();

    await seedUserAndUserAccount(
      { ethereumAddress: wallet.address },
      { accountId, activateToken }
    );

    const message =
      'SIGN THIS MESSAGE TO ACTIVATE YOUR ACCOUNT.\n\n' +
      `ACCOUNT ID:\n${accountId}\n\n` +
      `ADDRESS:\n${wallet.address}\n\n` +
      `TOKEN:\n${activateToken}`;

    const signature = await wallet.signMessage(message);

    const FORM_DATA = {
      signature,
      accountId,
    };

    const response = await this.client
      .post('/api/activate')
      .set('Accept', 'application/json')
      .send(FORM_DATA);

    expect(response.status).to.equal(400);
  });

  it('500 response when missing activateToken', async function () {
    const wallet = Wallet.createRandom();
    const accountId = faker.datatype.uuid();
    const activateToken = faker.datatype.uuid();

    await seedUser({ ethereumAddress: wallet.address });
    await seedUserAccount({
      accountId,
      activateToken: undefined,
    });

    const message =
      'SIGN THIS MESSAGE TO ACTIVATE YOUR ACCOUNT.\n\n' +
      `ACCOUNT ID:\n${accountId}\n\n` +
      `ADDRESS:\n${wallet.address}\n\n` +
      `TOKEN:\n${activateToken}`;

    const signature = await wallet.signMessage(message);

    const FORM_DATA = {
      ethereumAddress: wallet.address,
      signature,
      accountId,
    };

    return this.client
      .post('/api/activate')
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect(500);
  });

  it('401 response if signer address is not user ethereumAddress', async function () {
    const wallet = Wallet.createRandom();
    const wallet2 = Wallet.createRandom();
    const accountId = faker.datatype.uuid();
    const activateToken = faker.datatype.uuid();

    await seedUser({ ethereumAddress: wallet.address });
    await seedUserAccount({ accountId, activateToken });

    const message =
      'SIGN THIS MESSAGE TO ACTIVATE YOUR ACCOUNT.\n\n' +
      `ACCOUNT ID:\n${accountId}\n\n` +
      `ADDRESS:\n${wallet.address}\n\n` +
      `TOKEN:\n${activateToken}`;

    const signature = await wallet2.signMessage(message);

    const FORM_DATA = {
      ethereumAddress: wallet.address,
      signature,
      accountId,
    };

    return this.client
      .post('/api/activate')
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect(401);
  });

  it('400 response when missing accountId', async function () {
    const wallet = Wallet.createRandom();
    const accountId = faker.datatype.uuid();
    const activateToken = faker.datatype.uuid();

    await seedUserAndUserAccount(
      { ethereumAddress: wallet.address },
      { accountId, activateToken }
    );

    const message =
      'SIGN THIS MESSAGE TO ACTIVATE YOUR ACCOUNT.\n\n' +
      `ACCOUNT ID:\n${accountId}\n\n` +
      `ADDRESS:\n${wallet.address}\n\n` +
      `TOKEN:\n${activateToken}`;

    const signature = await wallet.signMessage(message);

    const FORM_DATA = {
      ethereumAddress: wallet.address,
      signature,
    };

    const response = await this.client
      .post('/api/activate')
      .set('Accept', 'application/json')
      .send(FORM_DATA);

    expect(response.status).to.equal(400);
  });

  it('400 response when ethereumAddress not matching', async function () {
    const wallet = Wallet.createRandom();
    const wallet2 = Wallet.createRandom();
    const accountId = faker.datatype.uuid();
    const activateToken = faker.datatype.uuid();

    await seedUserAndUserAccount(
      { ethereumAddress: wallet.address },
      { accountId, activateToken }
    );

    const message =
      'SIGN THIS MESSAGE TO ACTIVATE YOUR ACCOUNT.\n\n' +
      `ACCOUNT ID:\n${accountId}\n\n` +
      `ADDRESS:\n${wallet.address}\n\n` +
      `TOKEN:\n${activateToken}`;

    const signature = await wallet2.signMessage(message);

    const FORM_DATA = {
      ethereumAddress: wallet2.address,
      signature,
      accountId,
    };

    const response = await this.client
      .post('/api/activate')
      .set('Accept', 'application/json')
      .send(FORM_DATA);

    expect(response.status).to.equal(400);
  });

  it('400 response when user account already activated', async function () {
    const wallet = Wallet.createRandom();
    const accountId = faker.datatype.uuid();
    const activateToken = faker.datatype.uuid();

    await seedUserAndUserAccount(
      { ethereumAddress: wallet.address },
      { accountId, activateToken }
    );

    const message =
      'SIGN THIS MESSAGE TO ACTIVATE YOUR ACCOUNT.\n\n' +
      `ACCOUNT ID:\n${accountId}\n\n` +
      `ADDRESS:\n${wallet.address}\n\n` +
      `TOKEN:\n${activateToken}`;

    const signature = await wallet.signMessage(message);

    const FORM_DATA = {
      ethereumAddress: wallet.address,
      signature,
      accountId,
    };

    const response = await this.client
      .post('/api/activate')
      .set('Accept', 'application/json')
      .send(FORM_DATA);

    expect(response.status).to.equal(400);
  });
});
