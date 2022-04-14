import { Wallet } from 'ethers';
import { seedUser } from '../pre-start/seed';
import { expect } from 'chai';

describe('GET /api/auth/nonce', () => {
  it('200 response with json body', function () {
    const ETHEREUM_ADDRESS = '0x1234';

    return this.client
      .get(`/api/auth/nonce?ethereumAddress=${ETHEREUM_ADDRESS}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
  });
  it('404 response when missing ethereumAddress', function () {
    const ETHEREUM_ADDRESS = '';

    return this.client
      .get(`/api/auth/nonce?ethereumAddress=${ETHEREUM_ADDRESS}`)
      .expect(404);
  });
});

describe('POST /auth', () => {
  it('200 response with accessToken & refreshToken', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({ ethereumAddress: wallet.address });

    const response = await this.client.get(
      `/api/auth/nonce?ethereumAddress=${wallet.address}`
    );

    const message =
      'SIGN THIS MESSAGE TO LOGIN TO PRAISE.\n\n' +
      `ADDRESS:\n${wallet.address}\n\n` +
      `NONCE:\n${response.body.nonce as string}`;

    const signature = await wallet.signMessage(message);

    const FORM_DATA = {
      ethereumAddress: wallet.address,
      signature: signature,
    };

    const response2 = await this.client
      .post('/api/auth/')
      .set('Accept', 'application/json')
      .send(FORM_DATA);

    expect(response2.status).to.equal(200);
    expect(response2.body).to.have.property('accessToken');
    expect(response2.body).to.have.property('refreshToken');
  });

  it('404 response when ethereumAddress not recognized', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({ ethereumAddress: wallet.address });

    const walletUnrecognized = Wallet.createRandom();

    const response = await this.client.get(
      `/api/auth/nonce?ethereumAddress=${wallet.address}`
    );

    const message =
      'SIGN THIS MESSAGE TO LOGIN TO PRAISE.\n\n' +
      `ADDRESS:\n${wallet.address}\n\n` +
      `NONCE:\n${response.body.nonce as string}`;

    const signature = await wallet.signMessage(message);

    const FORM_DATA = {
      ethereumAddress: walletUnrecognized.address,
      signature: signature,
    };

    const response2 = await this.client
      .post('/api/auth/')
      .set('Accept', 'application/json')
      .send(FORM_DATA);

    expect(response2.status).to.equal(404);
  });

  it('401 response when signature mismatch', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({ ethereumAddress: wallet.address });

    const walletUnrecognized = Wallet.createRandom();

    const response = await this.client.get(
      `/api/auth/nonce?ethereumAddress=${wallet.address}`
    );

    const message =
      'SIGN THIS MESSAGE TO LOGIN TO PRAISE.\n\n' +
      `ADDRESS:\n${wallet.address}\n\n` +
      `NONCE:\n${response.body.nonce as string}`;

    const signature = await walletUnrecognized.signMessage(message);

    const FORM_DATA = {
      ethereumAddress: wallet.address,
      signature: signature,
    };

    const response2 = await this.client
      .post('/api/auth/')
      .set('Accept', 'application/json')
      .send(FORM_DATA);

    expect(response2.status).to.equal(401);
  });

  it('401 response when nonce invalid', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({ ethereumAddress: wallet.address });
    const NONCE = 'bad12345';

    await this.client.get(`/api/auth/nonce?ethereumAddress=${wallet.address}`);

    const message =
      'SIGN THIS MESSAGE TO LOGIN TO PRAISE.\n\n' +
      `ADDRESS:\n${wallet.address}\n\n` +
      `NONCE:\n${NONCE}`;

    const signature = await wallet.signMessage(message);

    const FORM_DATA = {
      ethereumAddress: wallet.address,
      signature: signature,
    };

    const response2 = await this.client
      .post('/api/auth/')
      .set('Accept', 'application/json')
      .send(FORM_DATA);

    expect(response2.status).to.equal(401);
  });

  it('401 response when message badly formatted', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({ ethereumAddress: wallet.address });

    const response = await this.client.get(
      `/api/auth/nonce?ethereumAddress=${wallet.address}`
    );

    const message =
      'BAD MESSAGE FORMAT.\n\n' +
      `ADDRESS:\n${wallet.address}\n\n` +
      `NONCE:\n${response.body.nonce as string}`;

    const signature = await wallet.signMessage(message);

    const FORM_DATA = {
      ethereumAddress: wallet.address,
      signature: signature,
    };

    const response2 = await this.client
      .post('/api/auth/')
      .set('Accept', 'application/json')
      .send(FORM_DATA);

    expect(response2.status).to.equal(401);
  });
});
