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

describe('AppController (e2e)', () => {
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
    it('should return 201 and correct body when identityEthAddress is valid, new user', async () => {
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
    it('should return 201 and correct body when identityEthAddress is valid, existing user', async () => {
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
    it('should return 401 when missing identityEthAddress', async () => {
      return request(server)
        .post('/auth/login')
        .send({ signature: 'any' })
        .expect(401);
    });
    it('should return 401 when missing signature', async () => {
      return request(server)
        .post('/auth/login')
        .send({ identityEthAddress: 'any' })
        .expect(401);
    });
    it('should return 401 when submitting identityEthAddress that does not exist', async () => {
      return request(server)
        .post('/auth/login')
        .send({ identityEthAddress: 'invalid', signature: 'any' })
        .expect(401);
    });
  });
});
