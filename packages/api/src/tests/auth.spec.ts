import { Wallet } from 'ethers';
import { Response } from 'supertest';
import { seedUser } from '../pre-start/seed';

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
      message: message,
      signature: signature,
    };

    this.client
      .post('/api/auth/')
      .set('Accept', 'application/json')
      .send(FORM_DATA)
      .expect(200, (res: Response) => {
        res.body.should.have.property('accessToken');
        res.body.should.have.property('refreshToken');
      });
  });
});
