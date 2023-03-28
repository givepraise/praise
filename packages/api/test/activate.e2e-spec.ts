import request from 'supertest';
import { Wallet } from 'ethers';
import { UserAccount } from '../src/useraccounts/schemas/useraccounts.schema';
import {
  server,
  activateService,
  usersService,
  userAccountsService,
  userAccountsSeeder,
} from './shared/nest';

describe('EventLog (E2E)', () => {
  describe('POST /api/activate - Activate user account', () => {
    beforeEach(async () => {
      //Clear the database
      await userAccountsService.getModel().deleteMany({});
      await usersService.getModel().deleteMany({});
    });

    test('400 when no accountId', async () => {
      await request(server)
        .post('/activate')
        .send({
          identityEthAddress: '0x123',
          signature: '0x123',
        })
        .expect(400);
    });

    test('400 when no identityEthAddress', async () => {
      await request(server)
        .post('/activate')
        .send({
          accountId: '0x123',
          signature: '0x123',
        })
        .expect(400);
    });

    test('404 account not found', async () => {
      await request(server)
        .post('/activate')
        .send({
          accountId: '0x123',
          identityEthAddress: '0x123',
        })
        .expect(400);
    });

    test('400 when invalid signature', async () => {
      const wallet = Wallet.createRandom();
      const ua: UserAccount = await userAccountsSeeder.seedUserAccount({
        user: undefined,
      });

      await request(server)
        .post('/activate')
        .send({
          accountId: ua.accountId,
          identityEthAddress: wallet.address,
          signature: 'invalid',
        })
        .expect(400);
    });

    test('404 when user account not found', async () => {
      const wallet = Wallet.createRandom();

      const signature = await wallet.signMessage(
        activateService.generateActivateMessage(
          'invalid account id',
          wallet.address,
          'invalid activate token',
        ),
      );

      await request(server)
        .post('/activate')
        .send({
          accountId: 'invalid account id',
          identityEthAddress: wallet.address,
          signature,
        })
        .expect(404);
    });

    test('400 activation token not found', async () => {
      const wallet = Wallet.createRandom();
      // Seed the database
      const ua: UserAccount = await userAccountsSeeder.seedUserAccount({
        user: undefined,
        activationToken: undefined,
      });

      const signature = await wallet.signMessage(
        activateService.generateActivateMessage(
          ua.accountId,
          wallet.address,
          'token not found',
        ),
      );

      await request(server)
        .post('/activate')
        .send({
          accountId: ua.accountId,
          signature,
        })
        .expect(400);
    });

    test('400 when account already activated', async () => {
      // Seed the database
      const wallet = Wallet.createRandom();
      const ua: UserAccount = await userAccountsSeeder.seedUserAccount({
        user: undefined,
      });

      const signature = await wallet.signMessage(
        activateService.generateActivateMessage(
          ua.accountId,
          wallet.address,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          ua.activateToken!,
        ),
      );

      await request(server)
        .post('/activate')
        .send({
          accountId: ua.accountId,
          identityEthAddress: wallet.address,
          signature,
        })
        .expect(201);

      const response = await request(server)
        .post('/activate')
        .send({
          accountId: ua.accountId,
          identityEthAddress: wallet.address,
          signature,
        })
        .expect(404);
      expect(response.body.code).toBe(1004); //Activation token not found
    });

    test('400 when signing using wrong wallet', async () => {
      //Clear the database
      await userAccountsService.getModel().deleteMany({});
      await usersService.getModel().deleteMany({});

      // Seed the database
      const wallet = Wallet.createRandom();
      const ua: UserAccount = await userAccountsSeeder.seedUserAccount({
        user: undefined,
      });

      const wallet2 = Wallet.createRandom();
      const signature = await wallet2.signMessage(
        activateService.generateActivateMessage(
          ua.accountId,
          wallet.address,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          ua.activateToken!,
        ),
      );

      await request(server)
        .post('/activate')
        .send({
          accountId: ua.accountId,
          identityEthAddress: wallet.address,
          signature,
        })
        .expect(400);
    });

    test('201 and correct body when activating', async () => {
      const wallet = Wallet.createRandom();
      const ua: UserAccount = await userAccountsSeeder.seedUserAccount({
        user: undefined,
      });

      const signature = await wallet.signMessage(
        activateService.generateActivateMessage(
          ua.accountId,
          wallet.address,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          ua.activateToken!,
        ),
      );

      const response = await request(server)
        .post('/activate')
        .send({
          accountId: ua.accountId,
          identityEthAddress: wallet.address,
          signature,
        })
        .expect(201);

      const user = response.body;

      expect(user.identityEthAddress).toBe(wallet.address);
      expect(user.rewardsEthAddress).toBe(wallet.address);
    });
  });
});
