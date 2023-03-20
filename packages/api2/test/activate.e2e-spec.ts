import request from 'supertest';
import { Wallet } from 'ethers';
import { UserAccount } from '@/useraccounts/schemas/useraccounts.schema';
import {
  server,
  activateService,
  usersService,
  userAccountsService,
  userAccountsSeeder,
} from './shared/nest';

describe('EventLog (E2E)', () => {
  describe('POST /api/activate - Activate user account', () => {
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

    test('400 when no signature', async () => {
      await request(server)
        .post('/activate')
        .send({
          accountId: '0x123',
          identityEthAddress: '0x123',
        })
        .expect(400);
    });

    test('400 when invalid signature', async () => {
      await request(server)
        .post('/activate')
        .send({
          accountId: '0x123',
          identityEthAddress: '0x123',
          signature: '0x123',
        })
        .expect(400);
    });

    test('400 when account not found', async () => {
      const wallet = Wallet.createRandom();
      const signature = await wallet.signMessage(
        activateService.generateActivateMessage(
          wallet.address,
          wallet.address,
          '0x123',
        ),
      );

      await request(server)
        .post('/activate')
        .send({
          accountId: wallet.address,
          identityEthAddress: wallet.address,
          signature,
        })
        .expect(400);
    });

    test('400 when user account not found', async () => {
      //Clear the database
      await userAccountsService.getModel().deleteMany({});
      await usersService.getModel().deleteMany({});

      const wallet = Wallet.createRandom();
      const signature = await wallet.signMessage(
        activateService.generateActivateMessage(
          wallet.address,
          wallet.address,
          '0x123',
        ),
      );

      await request(server)
        .post('/activate')
        .send({
          accountId: wallet.address,
          identityEthAddress: wallet.address,
          signature,
        })
        .expect(400);
    });

    test('400 activation token not found', async () => {
      // Seed the database
      const wallet = Wallet.createRandom();
      const ua: UserAccount = await userAccountsSeeder.seedUserAccount({
        user: undefined,
        identityEthAddress: wallet.address,
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
          identityEthAddress: wallet.address,
          signature,
        })
        .expect(400);
    });

    test('400 when account already activated', async () => {
      //Clear the database
      await userAccountsService.getModel().deleteMany({});
      await usersService.getModel().deleteMany({});

      // Seed the database
      const wallet = Wallet.createRandom();
      const ua: UserAccount = await userAccountsSeeder.seedUserAccount({
        user: undefined,
        identityEthAddress: wallet.address,
      });

      const signature = await wallet.signMessage(
        activateService.generateActivateMessage(
          ua.accountId,
          wallet.address,
          ua.activateToken,
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

      await request(server)
        .post('/activate')
        .send({
          accountId: ua.accountId,
          identityEthAddress: wallet.address,
          signature,
        })
        .expect(400);
    });

    test('400 when signing using wrong wallet', async () => {
      //Clear the database
      await userAccountsService.getModel().deleteMany({});
      await usersService.getModel().deleteMany({});

      // Seed the database
      const wallet = Wallet.createRandom();
      const ua: UserAccount = await userAccountsSeeder.seedUserAccount({
        user: undefined,
        identityEthAddress: wallet.address,
      });

      const wallet2 = Wallet.createRandom();
      const signature = await wallet2.signMessage(
        activateService.generateActivateMessage(
          ua.accountId,
          wallet.address,
          ua.activateToken,
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
      //Clear the database
      await userAccountsService.getModel().deleteMany({});
      await usersService.getModel().deleteMany({});

      // Seed the database
      const wallet = Wallet.createRandom();
      const ua: UserAccount = await userAccountsSeeder.seedUserAccount({
        user: undefined,
        identityEthAddress: wallet.address,
      });

      const signature = await wallet.signMessage(
        activateService.generateActivateMessage(
          ua.accountId,
          wallet.address,
          ua.activateToken,
        ),
      );

      // const callback = (err: any, res: superagent.Response) => {
      //   if (err) {
      //     console.log(JSON.stringify(err));
      //   }
      // };
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
