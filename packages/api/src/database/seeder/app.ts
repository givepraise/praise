import addDays from 'date-fns/addDays';
import { faker } from '@faker-js/faker';
import range from 'lodash/range';
import logger from 'jet-logger';
import { PeriodModel } from '@/period/entities';
import { UserModel } from '@user/entities';
import { UserRole } from '@user/types';
import { seedUserAndUserAccount, seedPeriod, seedPraise } from './entities';

const PERIOD_NUMBER = 3;
const PERIOD_LENGTH_DAYS = 10;
const PRAISE_PER_PERIOD_NUMBER = 100;
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

/**
 * Seed users into database from PREDEFINED_USERS list
 *
 * @returns Promise
 */
const seedPredefinedUsers = async (): Promise<void> => {
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

/**
 * Seed fake users into database with only USER role,
 *  up to count of REGULAR_USERS_NUMBER
 *
 * @returns Promise
 */
const seedRegularUsers = async (): Promise<void> => {
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

/**
 * Seed fake users into database with USER and QUANTIFIER roles,
 *  up to count of QUANTIFIER_USERS_NUMBER
 *
 * @returns Promise
 */
const seedQuantifierUsers = async (): Promise<void> => {
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

/**
 * Seed users into database with USER and ADMIN roles,
 *  as defined in env variable ADMINS
 *
 * @returns Promise
 */
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

/**
 * Seed fake periods and fake praises associated with each period into database
 * Based on PERIOD_NUMBER, PERIOD_LENGTH_DAYS, PRAISE_PER_PERIOD_NUMBER
 *
 * @returns Promise
 */
const seedPeriodsWithPraises = async (): Promise<void> => {
  const periodsCount = await PeriodModel.count();

  if (periodsCount === 0) {
    try {
      logger.info('Trying to seed database with periods.');

      const daysInPast = PERIOD_NUMBER * PERIOD_LENGTH_DAYS;
      let startDate = addDays(new Date(), -1 * daysInPast);

      for (let i = 0; i < PERIOD_NUMBER; i++) {
        const endDate = addDays(startDate, PERIOD_LENGTH_DAYS);

        // Seed period
        await seedPeriod({
          name: `Period ${i + 1}`,
          endDate,
        });

        // Seed all praises for period
        await Promise.all(
          range(0, PRAISE_PER_PERIOD_NUMBER).map(() =>
            seedPraise({
              createdAt: faker.date.between(startDate, endDate),
            })
          )
        );

        startDate = endDate;
      }

      logger.info('Periods seeding completed.');
    } catch (e) {
      console.log('ERROR:', e);
    }
  }
};

/**
 * Seed database with all fake data necessary for usable development environment
 *
 * @returns Promise
 */
export const seedData = async (): Promise<void> => {
  logger.info('Seeding database with fake data.');

  await seedPredefinedUsers();
  await seedRegularUsers();
  await seedQuantifierUsers();

  await seedPeriodsWithPraises();
};
