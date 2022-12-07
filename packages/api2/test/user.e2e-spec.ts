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

const loginUser = async (app: INestApplication, wallet: Wallet) => {
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

describe('UserController (E2E)', () => {
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

  // beforeEach(async () => {});

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/users', () => {
    test('401 when not authenticated', async () => {
      return request(server).get('/users').send().expect(401);
    });
    test('200 when authenticated', async () => {
      const wallet = Wallet.createRandom();
      const { accessToken } = await loginUser(app, wallet);
      const response = await request(server)
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });
});
