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
import { ServiceExceptionFilter } from '@/shared/service-exception.filter';
import { UsersService } from '@/users/users.service';
import { UsersModule } from '@/users/users.module';
import { UsersSeeder } from '@/database/seeder/users.seeder';
import { generateLoginMessage } from '@/auth/auth.utils';

describe('AuthController (E2E)', () => {
  let app: INestApplication;
  let server: Server;
  let module: TestingModule;
  let usersSeeder: UsersSeeder;
  let usersService: UsersService;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule, UsersModule],
      providers: [UsersService, UsersSeeder],
    }).compile();
    app = module.createNestApplication();
    app.useLogger(new ConsoleLogger());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );
    app.useGlobalFilters(new ServiceExceptionFilter());
    server = app.getHttpServer();
    await app.init();
    usersSeeder = module.get<UsersSeeder>(UsersSeeder);
    usersService = module.get<UsersService>(UsersService);
  });

  beforeEach(async () => {
    await usersService.getModel().deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/nonce', () => {
    test('400 when missing identityEthAddress', async () => {
      return request(server).post('/auth/nonce').send().expect(400);
    });
    test('400 when identityEthAddress is empty', async () => {
      return request(server)
        .post('/auth/nonce')
        .send(JSON.stringify({ identityEthAddress: '' }))
        .expect(400);
    });
    test('400 when identityEthAddress is invalid', async () => {
      return request(server)
        .post('/auth/nonce')
        .send({ identityEthAddress: 'invalid' })
        .expect(400);
    });
    test('201 and correct body when identityEthAddress is valid, new user', async () => {
      const wallet = Wallet.createRandom();
      return request(server)
        .post('/auth/nonce')
        .send({
          identityEthAddress: wallet.address,
        })
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
    test('201 and correct body when identityEthAddress is valid, existing user', async () => {
      const wallet = Wallet.createRandom();
      await usersSeeder.seedUser({
        identityEthAddress: wallet.address,
      });
      return request(server)
        .post('/auth/nonce')
        .send({
          identityEthAddress: wallet.address,
        })
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

  describe('POST /api/auth/login', () => {
    test('401 when missing identityEthAddress', async () => {
      return request(server)
        .post('/auth/login')
        .send({ signature: 'any' })
        .expect(401);
    });
    test('401 when missing signature', async () => {
      return request(server)
        .post('/auth/login')
        .send({ identityEthAddress: 'any' })
        .expect(401);
    });
    test('401 when submitting identityEthAddress that does not exist', async () => {
      return request(server)
        .post('/auth/login')
        .send({ identityEthAddress: 'invalid', signature: 'any' })
        .expect(401);
    });
    test('401 response when signature mismatch', async function () {
      const wallet = Wallet.createRandom();

      await request(server)
        .post('/auth/nonce')
        .send({ identityEthAddress: wallet.address });

      const signature = 'invalid signature';

      const body = {
        identityEthAddress: wallet.address,
        signature: signature,
      };

      return request(server).post('/auth/login').send(body).expect(401);
    });
    test('401 response when nonce invalid', async function () {
      const wallet = Wallet.createRandom();

      await request(server)
        .post('/auth/nonce')
        .send({ identityEthAddress: wallet.address });

      const message = generateLoginMessage(wallet.address, 'invalid nonce');
      const signature = await wallet.signMessage(message);

      const body = {
        identityEthAddress: wallet.address,
        signature: signature,
      };

      return request(server).post('/auth/login').send(body).expect(401);
    });
    test('401 response when message badly formatted', async function () {
      const wallet = Wallet.createRandom();

      const response = await request(server)
        .post('/auth/nonce')
        .send({ identityEthAddress: wallet.address });

      const message =
        'BAD MESSAGE FORMAT.\n\n' +
        `ADDRESS:\n${wallet.address}\n\n` +
        `NONCE:\n${response.body.nonce as string}`;
      const signature = await wallet.signMessage(message);

      const body = {
        identityEthAddress: wallet.address,
        signature: signature,
      };

      return request(server).post('/auth/login').send(body).expect(401);
    });
    test('201 response with accessToken & refreshToken', async function () {
      const wallet = Wallet.createRandom();

      const response = await request(server)
        .post('/auth/nonce')
        .send({ identityEthAddress: wallet.address });

      const message = generateLoginMessage(wallet.address, response.body.nonce);
      const signature = await wallet.signMessage(message);

      const body = {
        identityEthAddress: wallet.address,
        signature: signature,
      };

      return request(server)
        .post('/auth/login')
        .send(body)
        .expect(201)
        .then((response2) => {
          expect(response2.body.tokenType).toEqual('Bearer');
          expect(response2.body.identityEthAddress).toEqual(wallet.address);
          expect(response2.body).toHaveProperty('accessToken');
        });
    });
  });
});
