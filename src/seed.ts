import PeriodModel from '@entities/Period';
import PraiseModel from '@entities/Praise';
import UserModel from '@entities/User';
import UserAccountModel from '@entities/UserAccount';
import faker from 'faker';

const periodStatuses = ['OPEN', 'QUANTIFY', 'CLOSED'];
const roles = ['ADMIN', 'USER', 'QUANTIFIER'];

const USER_NUMBER = 15;
const PERIOD_NUMBER = 10;
const PERIOD_LENGTH = 10;
const PRAISE_NUMBER = 100;

const twoRandomAccountIndexes = () => {
  const n1 = Math.floor(Math.random() * (USER_NUMBER - 1));
  const n2 = n1 === USER_NUMBER - 1 ? USER_NUMBER - 2 : n1 + 1;
  return [n1, n2];
};

const seedData = async () => {
  const periodsCount = await PeriodModel.count();
  const praisesCount = await PraiseModel.count();
  const userCount = await UserModel.count();

  if (periodsCount < PERIOD_NUMBER) {
    let d = new Date();
    for (let i = 0; i < PERIOD_NUMBER; i++) {
      await PeriodModel.create({
        name: faker.lorem.words(),
        status:
          periodStatuses[Math.floor(Math.random() * periodStatuses.length)],
        endDate: d,
        quantifiers: [],
      });
      d.setDate(d.getDate() + PERIOD_LENGTH);
    }
  }

  if (userCount < USER_NUMBER) {
    for (let i = 0; i < USER_NUMBER; i++) {
      try {
        const account = await UserAccountModel.create({
          id: faker.datatype.uuid(),
          username: faker.internet.userName(),
          profileImageUrl: faker.image.imageUrl(),
          platform: 'DISCORD',
        });

        await UserModel.create({
          ethereumAddress: faker.datatype.uuid(),
          accounts: [account._id],
          roles: ['QUANTIFIER'],
        });
      } catch (e) {
        console.log('ERROR:', e);
      }
    }

    await UserModel.create({
      ethereumAddress: '0xa32aECda752cF4EF89956e83d60C04835d4FA867',
      roles: ['ADMIN', 'USER'],
    });
  }

  if (praisesCount < PRAISE_NUMBER) {
    for (let i = 0; i < PRAISE_NUMBER; i++) {
      const accounts = twoRandomAccountIndexes();

      const giver = await UserAccountModel.findOne().skip(accounts[0]);
      const receiver = await UserAccountModel.findOne().skip(accounts[1]);

      try {
        let randomDays = Math.floor(
          Math.random() * PERIOD_NUMBER * PERIOD_LENGTH
        );
        PraiseModel.create({
          reason: faker.lorem.sentences(),
          giver: giver!._id,
          receiver: receiver!._id,
          createdAt: new Date(Date.now() + randomDays * 86400000),
        });
      } catch (e) {
        console.log('ERROR:', e);
      }
    }
  }
};

export default seedData;
