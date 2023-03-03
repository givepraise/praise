import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { Server } from 'http';
import { Wallet } from 'ethers';
import { ServiceExceptionFilter } from '@/shared/filters/service-exception.filter';
import { UsersService } from '@/users/users.service';
import { UsersModule } from '@/users/users.module';
import { UsersSeeder } from '@/database/seeder/users.seeder';
import { EthSignatureService } from '@/auth/eth-signature.service';
import { EventLogModule } from '@/event-log/event-log.module';
import { runDbMigrations } from '@/database/migrations';
import { ApiKeySeeder } from '@/database/seeder/api-key.seeder';
import { ApiKeyModule } from '@/api-key/api-key.module';
import { MongoServerErrorFilter } from '@/shared/filters/mongo-server-error.filter';
import { MongoValidationErrorFilter } from '@/shared/filters/mongo-validation-error.filter';

describe('AuthController (E2E)', () => {
  let app: INestApplication;
  let server: Server;
  let module: TestingModule;
  let usersSeeder: UsersSeeder;
  let usersService: UsersService;
  let ethSignatureService: EthSignatureService;
  let apiKeySeeder: ApiKeySeeder;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule, UsersModule, EventLogModule, ApiKeyModule],
      providers: [UsersSeeder, ApiKeySeeder],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );
    app.useGlobalFilters(new MongoServerErrorFilter());
    app.useGlobalFilters(new MongoValidationErrorFilter());
    app.useGlobalFilters(new ServiceExceptionFilter());
    server = app.getHttpServer();
    await app.init();
    await runDbMigrations(app);
    usersSeeder = module.get<UsersSeeder>(UsersSeeder);
    usersService = module.get<UsersService>(UsersService);
    ethSignatureService = module.get<EthSignatureService>(EthSignatureService);
    apiKeySeeder = module.get<ApiKeySeeder>(ApiKeySeeder);
  });

  beforeEach(async () => {
    await usersService.getModel().deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/eth-signature/nonce', () => {
    /**
     *
     */
    test('400 when missing identityEthAddress', async () => {
      return request(server)
        .post('/auth/eth-signature/nonce')
        .send()
        .expect(400);
    });

    /**
     *
     */
    test('400 when identityEthAddress is empty', async () => {
      return request(server)
        .post('/auth/eth-signature/nonce')
        .send(JSON.stringify({ identityEthAddress: '' }))
        .expect(400);
    });

    /**
     *
     */
    test('400 when identityEthAddress is invalid', async () => {
      return request(server)
        .post('/auth/eth-signature/nonce')
        .send({ identityEthAddress: 'invalid' })
        .expect(400);
    });

    /**
     *
     */
    test('201 and correct body when identityEthAddress is valid, new user', async () => {
      const wallet = Wallet.createRandom();
      return request(server)
        .post('/auth/eth-signature/nonce')
        .send({
          identityEthAddress: wallet.address,
        })
        .expect(201)
        .then((response) => {
          const rb = response.body;
          expect(rb).toHaveProperty('nonce');
          expect(rb.nonce).not.toBeNull();
          expect(rb.nonce).not.toBeUndefined();
          expect(rb.nonce).not.toEqual('');
          expect(rb).toHaveProperty('identityEthAddress');
          expect(rb.identityEthAddress).toEqual(wallet.address);
        });
    });

    /**
     *
     */
    test('201 and correct body when identityEthAddress is valid, existing user', async () => {
      const wallet = Wallet.createRandom();
      await usersSeeder.seedUser({
        identityEthAddress: wallet.address,
      });
      return request(server)
        .post('/auth/eth-signature/nonce')
        .send({
          identityEthAddress: wallet.address,
        })
        .expect(201)
        .then((response) => {
          const rb = response.body;
          expect(rb).toHaveProperty('nonce');
          expect(rb.nonce).not.toBeNull();
          expect(rb.nonce).not.toBeUndefined();
          expect(rb.nonce).not.toEqual('');
          expect(rb).toHaveProperty('identityEthAddress');
          expect(rb.identityEthAddress).toEqual(wallet.address);
        });
    });
  });

  describe('POST /api/auth/eth-signature/login', () => {
    test('401 when missing identityEthAddress', async () => {
      return request(server)
        .post('/auth/eth-signature/login')
        .send({ signature: 'any' })
        .expect(401);
    });

    /**
     *
     */
    test('401 when missing signature', async () => {
      return request(server)
        .post('/auth/eth-signature/login')
        .send({ identityEthAddress: 'any' })
        .expect(401);
    });

    /**
     *
     */
    test('401 when submitting identityEthAddress that does not exist', async () => {
      await request(server)
        .post('/auth/eth-signature/login')
        .send({ identityEthAddress: 'invalid', signature: 'any' })
        .expect(401);
    });

    /**
     *
     */
    test('401 response when signature mismatch', async function () {
      const wallet = Wallet.createRandom();

      await request(server)
        .post('/auth/eth-signature/nonce')
        .send({ identityEthAddress: wallet.address });

      const signature = 'invalid signature';

      const body = {
        identityEthAddress: wallet.address,
        signature: signature,
      };

      return request(server)
        .post('/auth/eth-signature/login')
        .send(body)
        .expect(401);
    });

    /**
     *
     */
    test('401 response when nonce invalid', async function () {
      const wallet = Wallet.createRandom();

      await request(server)
        .post('/auth/eth-signature/nonce')
        .send({ identityEthAddress: wallet.address });

      const message = ethSignatureService.generateLoginMessage(
        wallet.address,
        'invalid nonce',
      );
      const signature = await wallet.signMessage(message);

      const body = {
        identityEthAddress: wallet.address,
        signature: signature,
      };

      return request(server)
        .post('/auth/eth-signature/login')
        .send(body)
        .expect(401);
    });

    /**
     *
     */
    test('401 response when message badly formatted', async function () {
      const wallet = Wallet.createRandom();

      const response = await request(server)
        .post('/auth/eth-signature/nonce')
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

      return request(server)
        .post('/auth/eth-signature/login')
        .send(body)
        .expect(401);
    });

    /**
     *
     */
    test('201 response with accessToken & refreshToken', async function () {
      const wallet = Wallet.createRandom();

      const response = await request(server)
        .post('/auth/eth-signature/nonce')
        .send({ identityEthAddress: wallet.address });

      const message = ethSignatureService.generateLoginMessage(
        wallet.address,
        response.body.nonce,
      );
      const signature = await wallet.signMessage(message);

      const body = {
        identityEthAddress: wallet.address,
        signature: signature,
      };

      return request(server)
        .post('/auth/eth-signature/login')
        .send(body)
        .expect(201)
        .then((response2) => {
          expect(response2.body.tokenType).toEqual('Bearer');
          expect(response2.body.identityEthAddress).toEqual(wallet.address);
          expect(response2.body).toHaveProperty('accessToken');
        });
    });
  });

  describe('Database API KEY authentication, GET /api/users', () => {
    test('401 when missing api key', async () => {
      return request(server).get('/users').expect(401);
    });

    /**
     *
     */
    test('401 when api key is invalid', async () => {
      return request(server).get('/users').set('token', 'invalid').expect(401);
    });

    /**
     *
     */
    test('200 when api key is valid', async () => {
      const apiKey = await apiKeySeeder.seedApiKey();
      return request(server)
        .get('/users')
        .set('x-api-key', apiKey.key)
        .expect(200);
    });
  });

  describe('.env API KEY authentication, GET /api/users', () => {
    /**
     *
     */
    test('403 when accessing disallowed endpoint /api/users', async () => {
      const apiKey = process.env.DISCORD_BOT_API_KEY;
      expect(apiKey).not.toBeUndefined();
      if (apiKey) {
        return request(server)
          .get('/users')
          .set('x-api-key', apiKey)
          .expect(403);
      }
    });

    /**
     *
     */
    test('200 when accessing allowed endpoint /api/communities', async () => {
      const apiKey = process.env.DISCORD_BOT_API_KEY;
      expect(apiKey).not.toBeUndefined();
      if (apiKey) {
        return request(server)
          .get('/communities')
          .set('x-api-key', apiKey)
          .expect(200);
      }
    });
  });
});
