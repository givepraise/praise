import { PeriodModel } from '@period/entities';
import { PraiseModel } from '@praise/entities';
import { UserModel } from '@user/entities';
import { UserRole } from '@user/types';
import { seedUserAndUserAccount, seedPeriod, seedPraise } from './entities';
import logger from 'jet-logger';

const PERIOD_NUMBER = 3;
const PERIOD_LENGTH = 10;
const PRAISE_NUMBER = 300;
const QUANTIFIER_USERS_NUMBER = 10;
const REGULAR_USERS_NUMBER = 10;
const PREDEFINED_USERS = [
  {
    ethereumAddress: '0xa32aECda752cF4EF89956e83d60C04835d4FA867', // Kristofer
    roles: ['ADMIN', 'USER'],
  },
  {
    ethereumAddress: '0x826976d7C600d45FB8287CA1d7c76FC8eb732030', // Mitch
    roles: ['ADMIN', 'USER'],
  },
  {
    ethereumAddress: '0xc617C1B5c78E76aaA33e6d1964b24A4f923077f7', // Nebs
    roles: ['ADMIN', 'USER'],
  },
  {
    ethereumAddress: '0x44FEa69505B8B3dA031Cf0cc2420f6114ED78E4f',
    roles: ['USER', 'QUANTIFIER'],
  },
];

export const seedPeriods = async (): Promise<void> => {
  const periodsCount = await PeriodModel.count();

  if (periodsCount === 0) {
    try {
      logger.info('Trying to seed database with periods.');
      const d = new Date();
      for (let i = 0; i < PERIOD_NUMBER; i++) {
        await seedPeriod({
          name: `Period ${i + 1}`,
          endDate: d,
        });
        d.setDate(d.getDate() + PERIOD_LENGTH);
      }

      logger.info('Periods seeding completed.');
    } catch (e) {
      console.log('ERROR:', e);
    }
  }
};

export const seedPredefinedUsers = async (): Promise<void> => {
  const userCount = await UserModel.count();

  if (userCount < PREDEFINED_USERS.length) {
    for (let i = 0; i < PREDEFINED_USERS.length; i++) {
      try {
        await seedUserAndUserAccount({
          ethereumAddress: PREDEFINED_USERS[i].ethereumAddress,
          roles: PREDEFINED_USERS[i].roles,
        });
      } catch (e) {
        console.log('ERROR:', e);
      }
    }
  }
};

export const seedRegularUsers = async (): Promise<void> => {
  try {
    const userCount = await UserModel.count({ roles: ['USER'] });

    if (userCount < REGULAR_USERS_NUMBER) {
      logger.info('Trying to seed database with regular users.');
      for (let i = 0; i < REGULAR_USERS_NUMBER; i++) {
        try {
          await seedUserAndUserAccount({
            roles: ['USER'],
          });
        } catch (e) {
          console.log('ERROR:', e);
        }
      }

      logger.info('Regular users seeding completed.');
    }
  } catch (e) {
    console.log('ERROR:', e);
  }
};

export const seedQuantifierUsers = async (): Promise<void> => {
  try {
    const userCount = await UserModel.count({ roles: ['USER', 'QUANTIFIER'] });

    if (userCount < QUANTIFIER_USERS_NUMBER) {
      logger.info('Trying to seed database with quantifiers.');

      for (let i = 0; i < QUANTIFIER_USERS_NUMBER; i++) {
        try {
          await seedUserAndUserAccount({
            roles: ['USER', 'QUANTIFIER'],
          });
        } catch (e) {
          console.log('ERROR:', e);
        }
      }

      logger.info('Quantifiers seeding completed.');
    }
  } catch (e) {
    console.log('ERROR:', e);
  }
};

export const seedAdminUsers = async (): Promise<void> => {
  const admins = process.env.ADMINS as string;
  const ethAddresses = admins
    .split(',')
    .filter(Boolean)
    .map((item) => {
      return item.trim();
    });

  for (const e of ethAddresses) {
    const user = await UserModel.findOne({ ethereumAddress: e });

    if (user) {
      if (!user.roles.includes(UserRole.ADMIN)) {
        user.roles.push(UserRole.ADMIN);
        await user.save();
      }
      if (!user.roles.includes(UserRole.USER)) {
        user.roles.push(UserRole.USER);
        await user.save();
      }
    } else {
      await UserModel.create({
        ethereumAddress: e,
        roles: [UserRole.ADMIN, UserRole.USER],
      });
    }
  }
};

export const seedPraises = async (): Promise<void> => {
  try {
    const praisesCount = await PraiseModel.count();

    if (praisesCount < PRAISE_NUMBER) {
      logger.info('Trying to seed database with praises.');

      for (let i = 0; i < PRAISE_NUMBER; i++) {
        await seedPraise();
      }

      logger.info('Praises seeding completed.');
    }
  } catch (e) {
    console.log('ERROR:', e);
  }
};

export const seedData = async (): Promise<void> => {
  logger.info('Seeding database with fake data.');

  await seedPeriods();
  await seedPredefinedUsers();
  await seedRegularUsers();
  await seedQuantifierUsers();
  await seedPraises();
};
