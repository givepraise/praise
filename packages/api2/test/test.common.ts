import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Wallet } from 'ethers';
import { TestingModule } from '@nestjs/testing';
import { EthSignatureService } from '@/auth/eth-signature.service';

export const loginUser = async (
  app: INestApplication,
  module: TestingModule,
  wallet: Wallet,
) => {
  const nonceResponse = await request(app.getHttpServer())
    .post('/auth/eth-signature/nonce')
    .send({
      identityEthAddress: wallet.address,
    })
    .expect(201);
  const { nonce } = nonceResponse.body;
  const ethSignatureService =
    module.get<EthSignatureService>(EthSignatureService);
  const message = ethSignatureService.generateLoginMessage(
    wallet.address,
    nonce,
  );
  const signature = await wallet.signMessage(message);
  const loginResponse = await request(app.getHttpServer())
    .post('/auth/eth-signature/login')
    .send({
      identityEthAddress: wallet.address,
      signature,
    })
    .expect(201);
  return loginResponse.body;
};

export const authorizedGetRequest = (
  url: string,
  app: INestApplication,
  accessToken: string,
) => {
  return request(app.getHttpServer())
    .get(url)
    .set('Authorization', `Bearer ${accessToken}`);
};

export const authorizedPostRequest = (
  url: string,
  app: INestApplication,
  accessToken: string,
  body: any,
) => {
  return request(app.getHttpServer())
    .post(url)
    .set('Authorization', `Bearer ${accessToken}`)
    .send(body);
};

export const authorizedPutRequest = (
  url: string,
  app: INestApplication,
  accessToken: string,
  body: any,
) => {
  return request(app.getHttpServer())
    .put(url)
    .set('Authorization', `Bearer ${accessToken}`)
    .send(body);
};

export const authorizedDeleteRequest = (
  url: string,
  app: INestApplication,
  accessToken: string,
) => {
  return request(app.getHttpServer())
    .delete(url)
    .set('Authorization', `Bearer ${accessToken}`);
};
