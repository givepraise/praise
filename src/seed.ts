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

  if (periodsCount < 10) {
    for (let i = 0; i < 10; i++) {
      await PeriodModel.create({
        name: faker.lorem.words(),
        status:
          periodStatuses[Math.floor(Math.random() * periodStatuses.length)],
        endDate: faker.date.future(),
        quantifiers: [],
      });
    }
  }

  if (praisesCount < 30) {
    PeriodModel.count().exec((err, count) => {
      var random = Math.floor(Math.random() * count);
      PeriodModel.findOne()
        .skip(random)
        .exec(async (err, period) => {
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

            for (let i = 0; i < 30; i++) {
              PraiseModel.create({
                period,
                reason: faker.lorem.sentences(),
                quantifications: [
                  {
                    quantifier,
                    score: faker.datatype.number(),
                    dismissed: faker.datatype.boolean(),
                  },
                ],
                giver,
                receiver,
              });
            }
          } catch (e) {
            console.log('ERROR:', e);
          }
        });
    });
  }
};

export default seedData;
