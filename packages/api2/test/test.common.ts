import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Wallet } from 'ethers';
import { generateLoginMessage } from '@/auth/auth.utils';

export const loginUser = async (app: INestApplication, wallet: Wallet) => {
  const nonceResponse = await request(app.getHttpServer())
    .post('/auth/nonce')
    .send({
      identityEthAddress: wallet.address,
    })
    .expect(201);
  const { nonce } = nonceResponse.body;
  const message = generateLoginMessage(wallet.address, nonce);
  const signature = await wallet.signMessage(message);
  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      identityEthAddress: wallet.address,
      signature,
    })
    .expect(201);
  return loginResponse.body;
};

export const authorizedRequest = (
  url: string,
  app: INestApplication,
  accessToken: string,
) => {
  return request(app.getHttpServer())
    .get(url)
    .set('Authorization', `Bearer ${accessToken}`);
};
