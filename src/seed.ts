import PeriodModel from '@entities/Period';
import PraiseModel from '@entities/Praise';
import UserModel from '@entities/User';
import UserAccountModel from '@entities/UserAccount';
import faker from 'faker';

const periodStatuses = ['OPEN', 'QUANTIFY', 'CLOSED'];
const roles = ['ADMIN', 'USER', 'QUANTIFIER'];

const seedData = async () => {
  const periodsCount = await PeriodModel.count();
  const praisesCount = await PraiseModel.count();
  const userCount = await UserModel.count();

  if (periodsCount < 10) {
    let d = new Date();
    for (let i = 0; i < 10; i++) {
      await PeriodModel.create({
        name: faker.lorem.words(),
        status:
          periodStatuses[Math.floor(Math.random() * periodStatuses.length)],
        endDate: d,
        quantifiers: [],
      });
      d.setDate(d.getDate() + 10);
    }
  }

  if (userCount < 15) {
    for (let i = 0; i < 15; i++) {
      try {
        const quantifier = await UserModel.create({
          ethereumAddress: faker.datatype.uuid(),
          accounts: [
            {
              id: faker.datatype.uuid(),
              username: faker.internet.userName(),
              profileImageUrl: faker.image.imageUrl(),
              platform: 'DISCORD',
            },
          ],
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

  if (praisesCount < 30) {
    for (let i = 0; i < 10; i++) {
      PeriodModel.count().exec((err, count) => {
        var random = Math.floor(Math.random() * count);
        PeriodModel.findOne()
          .skip(random)
          .exec(async (err, period) => {
            try {
              const giver = await UserAccountModel.create({
                id: faker.datatype.uuid(),
                username: faker.internet.userName(),
                profileImageUrl: faker.image.imageUrl(),
                platform: 'DISCORD',
              });

              const receiver = await UserAccountModel.create({
                id: faker.datatype.uuid(),
                username: faker.internet.userName(),
                profileImageUrl: faker.image.imageUrl(),
                platform: 'DISCORD',
              });

              for (let i = 0; i < 10; i++) {
                let randomDays = Math.floor(Math.random() * count * 10);
                PraiseModel.create({
                  period,
                  reason: faker.lorem.sentences(),
                  giver,
                  receiver,
                  createdAt: new Date(Date.now() + randomDays * 86400000),
                });
              }
            } catch (e) {
              console.log('ERROR:', e);
            }
          });
      });
    }
  }
};

export default seedData;
