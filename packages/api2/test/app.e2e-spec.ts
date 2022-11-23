import * as request from 'supertest';
import {
  ConsoleLogger,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { Server } from 'http';
import { Wallet } from 'ethers';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useLogger(new ConsoleLogger());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );
    server = app.getHttpServer();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/nonce', () => {
    it('should return 400 when missing identityEthAddress', async () => {
      return request(server).post('/auth/nonce').send().expect(400);
    });
    it('should return 400 when identityEthAddress is empty', async () => {
      return request(server)
        .post('/auth/nonce')
        .send(JSON.stringify({ identityEthAddress: '' }))
        .expect(400);
    });
    it('should return 400 when identityEthAddress is invalid', async () => {
      return request(server)
        .post('/auth/nonce')
        .send({ identityEthAddress: 'invalid' })
        .expect(400);
    });
    it('should return 201 and correct body when identityEthAddress is valid', async () => {
      const wallet = Wallet.createRandom();
      return request(server)
        .post('/auth/nonce')
        .send({ identityEthAddress: wallet.address })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('nonce');
          expect(response.body.nonce).not.toBeNull();
          expect(response.body.nonce).not.toBeUndefined();
          expect(response.body.nonce).not.toEqual('');
          expect(response.body).toHaveProperty('identityEthAddress');
          expect(response.body.identityEthAddress).toEqual(wallet.address);
        });
    });
  });
});