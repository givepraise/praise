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

export const authorizedRequest = (
  url: string,
  app: INestApplication,
  accessToken: string,
) => {
  return request(app.getHttpServer())
    .get(url)
    .set('Authorization', `Bearer ${accessToken}`);
};
