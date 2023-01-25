import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Wallet } from 'ethers';
import { TestingModule } from '@nestjs/testing';
import { EthSignatureService } from '@/auth/eth-signature.service';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import '@testing-library/jest-dom';

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

export const authorizedPatchRequest = (
  url: string,
  app: INestApplication,
  accessToken: string,
  body: any,
) => {
  return request(app.getHttpServer())
    .patch(url)
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

expect.extend({
  /**
   * Custom jest matcher to check if an object is valid according to a class.
   */
  async toBeValidClass(received: any, expectedClass: ClassConstructor<any>) {
    const instance = plainToInstance(expectedClass, received);
    const v = await validate(instance);
    console.log(JSON.stringify(v));
    if (v.length === 0) {
      return {
        message: () =>
          `expected object to be valid according to class ${expectedClass.name}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `FAILED expected object to be valid according to class ${
            expectedClass.name
          }.\n\nObject: ${JSON.stringify(received, undefined, 2)}\n${v.map(
            (e) => {
              let msg = '';
              if (Array.isArray(e.constraints)) {
                msg += e.constraints.map((c) => `\n- Constraint: ${c}`).join();
              } else {
                msg += `\n- Constraint: ${JSON.stringify(e.constraints)}`;
              }
              return msg;
            },
          )}))}`,
        pass: false,
      };
    }
  },
});
