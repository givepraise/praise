import { PeriodModel } from '@period/entities';
import { PraiseModel } from '@praise/entities';
import { UserModel } from '@user/entities';
import faker from 'faker';
import { UserAccountModel } from '@useraccount/entities';

const PERIOD_NUMBER = 3;
const PERIOD_LENGTH = 10;
const PRAISE_NUMBER = 300;

const USERS = [
  {
    ethereumAddress: '0xa32aECda752cF4EF89956e83d60C04835d4FA867', // Kristofer
    roles: ['ADMIN', 'USER'],
  },
  {
    ethereumAddress: '0x826976d7C600d45FB8287CA1d7c76FC8eb732030', // Mitch
    roles: ['ADMIN', 'USER'],
  },
  {
    ethereumAddress: '0xa123400000000000000000000000000000006789',
    roles: ['USER', 'QUANTIFIER'],
  },
  {
    ethereumAddress: '0xa123400000000000000000000000000000006789',
    roles: ['USER', 'QUANTIFIER'],
  },
  {
    ethereumAddress: '0xa123400000000000000000000000000000006789',
    roles: ['USER', 'QUANTIFIER'],
  },
  {
    ethereumAddress: '0xa123400000000000000000000000000000006789',
    roles: ['USER'],
  },
  {
    ethereumAddress: '0xa123400000000000000000000000000000006789',
    roles: ['USER'],
  },
  {
    ethereumAddress: '0xa123400000000000000000000000000000006789',
    roles: ['USER'],
  },
  {
    ethereumAddress: '0xa123400000000000000000000000000000006789',
    roles: ['USER'],
  },
  {
    ethereumAddress: '0xa123400000000000000000000000000000006789',
    roles: ['USER'],
  },
  {
    ethereumAddress: '0xa123400000000000000000000000000000006789',
    roles: ['USER'],
  },
  {
    ethereumAddress: '0xa123400000000000000000000000000000006789',
    roles: ['USER'],
  },
  {
    ethereumAddress: '0xa123400000000000000000000000000000006789',
    roles: ['USER'],
  },
];

const twoRandomAccountIndexes = (): Array<number> => {
  const n1 = Math.floor(Math.random() * (USERS.length - 1));
  let n2 = Math.floor(Math.random() * (USERS.length - 1));
  n2 = n2 === n1 ? (n1 === USERS.length - 1 ? USERS.length - 2 : n1 + 1) : n2;
  return [n1, n2];
};

const seedData = async (): Promise<void> => {
  const periodsCount = await PeriodModel.count();
  const praisesCount = await PraiseModel.count();
  const userCount = await UserModel.count();

  if (periodsCount < PERIOD_NUMBER) {
    const d = new Date();
    for (let i = 0; i < PERIOD_NUMBER; i++) {
      await PeriodModel.create({
        name: `Period ${i + 1}`,
        status: 'OPEN',
        // status:
        //   periodStatuses[Math.floor(Math.random() * periodStatuses.length)],
        endDate: d,
        quantifiers: [],
      });
      d.setDate(d.getDate() + PERIOD_LENGTH);
    }
  }

  if (userCount < USERS.length) {
    for (let i = 0; i < USERS.length; i++) {
      try {
        const account = await UserAccountModel.create({
          id: faker.datatype.uuid(),
          username: faker.internet.userName(),
          platform: 'DISCORD',
        });

        await UserModel.create({
          ethereumAddress: USERS[i].ethereumAddress,
          accounts: [account._id],
          roles: USERS[i].roles,
        });
      } catch (e) {
        console.log('ERROR:', e);
      }
    }
  }

  if (praisesCount < PRAISE_NUMBER) {
    for (let i = 0; i < PRAISE_NUMBER; i++) {
      const accounts = twoRandomAccountIndexes();

      const giver = await UserAccountModel.findOne().skip(accounts[0]);
      const receiver = await UserAccountModel.findOne().skip(accounts[1]);

      try {
        const randomDays = Math.floor(
          Math.random() * PERIOD_NUMBER * PERIOD_LENGTH
        );
        PraiseModel.create({
          reason: faker.lorem.sentences(),
          giver: giver!._id,
          sourceId: faker.datatype.uuid(),
          sourceName: faker.lorem.word(),
          receiver: receiver!._id,
          createdAt: new Date(
            Date.now() + (randomDays - PERIOD_LENGTH) * 86400000
          ),
        });
      } catch (e) {
        console.log('ERROR:', e);
      }
    }
  }
};

export { seedData };
