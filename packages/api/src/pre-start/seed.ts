import { PeriodModel } from '@period/entities';
import { PraiseModel, QuantificationModel } from '@praise/entities';
import { UserModel } from '@user/entities';
import { UserAccountModel } from '@useraccount/entities';
import { UserAccountDocument } from '@useraccount/types';
import { PraiseDocument, QuantificationDocument } from '@praise/types';
import { PeriodDocument } from '@period/types';
import { insertNewPeriodSettings } from '@periodsettings/utils';
import { faker } from '@faker-js/faker';
import logger from 'jet-logger';
import { UserDocument } from '@user/types';
import { EventLogDocument } from '@eventlog/types';
import { EventLogModel, EventLogTypeModel } from '@eventlog/entities';
import { SettingGroup, SettingDocument } from '@settings/types';
import { SettingsModel } from '@settings/entities';
import { PeriodSettingsModel } from '@periodsettings/entities';
import { PeriodSettingDocument } from '@periodsettings/types';

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

const fetchTwoRandomUserAccounts = async (): Promise<UserAccountDocument[]> => {
  const useraccounts = await UserAccountModel.aggregate([
    { $sample: { size: 2 } },
  ]);

  return useraccounts;
};

const seedUserAccount = async (
  userAccountData: Object = {}
): Promise<UserAccountDocument> => {
  const userAccount = await UserAccountModel.create({
    accountId: faker.datatype.uuid(),
    name: faker.internet.userName(),
    platform: 'DISCORD',
    ...userAccountData,
  });

  return userAccount;
};

const seedUser = async (userData: Object = {}): Promise<UserDocument> => {
  const user = await UserModel.create({
    ethereumAddress: faker.finance.ethereumAddress(),
    roles: ['USER'],
    ...userData,
  });

  return user;
};

const seedUserAndUserAccount = async (
  userData: Object = {},
  userAccountData: Object = {}
): Promise<[UserDocument, UserAccountDocument]> => {
  const user = await seedUser(userData);
  const userAccount = await seedUserAccount({
    user: user._id,
    ...userAccountData,
  });

  return [user, userAccount];
};

const seedPeriod = async (periodData: Object = {}): Promise<PeriodDocument> => {
  const period = await PeriodModel.create({
    name: `Period ${faker.random.alpha()}`,
    status: 'OPEN',
    endDate: faker.date.future(),
    ...periodData,
  });
  await insertNewPeriodSettings(period);

  return period;
};

const seedPeriods = async (): Promise<void> => {
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

const seedPraise = async (praiseData: Object = {}): Promise<PraiseDocument> => {
  let [giver, receiver] = await fetchTwoRandomUserAccounts();

  if (!giver) {
    giver = await seedUserAccount();
  }
  if (!receiver) {
    receiver = await seedUserAccount();
  }

  const randomDays = Math.floor(Math.random() * PERIOD_NUMBER * PERIOD_LENGTH);
  const reason = faker.lorem.sentences();
  const praise = await PraiseModel.create({
    reason,
    reasonRealized: reason,
    giver: giver._id,
    sourceId: faker.datatype.uuid(),
    sourceName: faker.lorem.word(),
    receiver: receiver._id,
    createdAt: new Date(Date.now() + (randomDays - PERIOD_LENGTH) * 86400000),
    ...praiseData,
  });

  return praise;
};

const seedPraises = async (): Promise<void> => {
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

const seedQuantification = async (
  praise: PraiseDocument,
  quantifierUser: UserDocument,
  quantificationData: Object = {}
): Promise<QuantificationDocument> => {
  const createdAt = faker.date.recent();

  const quantification: QuantificationDocument = new QuantificationModel({
    quantifier: quantifierUser._id,
    score: Math.random() * 150,
    dismissed: faker.datatype.boolean(),
    duplicatePraise: undefined,
    createdAt,
    updatedAt: createdAt,
    ...quantificationData,
  });

  praise.quantifications = [...praise.quantifications, quantification];
  await praise.save();

  return quantification;
};

const seedEventLog = async (
  eventLogData: Object = {}
): Promise<EventLogDocument> => {
  const createdAt = faker.date.recent();
  const randomUser = await seedUser();
  const eventLogTypes = await EventLogTypeModel.find({});
  const randomEventLogType = eventLogTypes
    .sort(() => 0.5 - Math.random())
    .slice(0, eventLogTypes.length)[0];

  const eventLog = await EventLogModel.create({
    user: randomUser._id,
    type: randomEventLogType._id,
    description: faker.lorem.lines(1),
    createdAt,
    updatedAt: createdAt,
    ...eventLogData,
  });

  return eventLog;
};

const seedSetting = async (
  settingData: Object = {}
): Promise<SettingDocument> => {
  const createdAt = faker.date.recent();

  const setting = await SettingsModel.create({
    key: faker.random.alphaNumeric(25),
    label: faker.word.noun(),
    type: 'Boolean',
    group: SettingGroup.APPLICATION,
    description: faker.lorem.sentence(),
    value: faker.datatype.boolean(),
    createdAt,
    updatedAt: createdAt,
    ...settingData,
  });

  return setting;
};

const seedPeriodSetting = async (
  periodSettingData: Object = {}
): Promise<PeriodSettingDocument> => {
  const createdAt = faker.date.recent();

  const periods: PeriodDocument[] = await PeriodModel.aggregate([
    { $sample: { size: 1 } },
  ]);
  if (!periods) throw new Error('No periods exist to seed PeriodSettings for');

  const period = periods[0];

  const periodsetting = await PeriodSettingsModel.create({
    key: faker.random.alphaNumeric(25),
    label: faker.word.noun(),
    type: 'Boolean',
    group: SettingGroup.APPLICATION,
    description: faker.lorem.sentence(),
    value: faker.datatype.boolean(),
    createdAt,
    updatedAt: createdAt,
    period: period._id,
    ...periodSettingData,
  });

  return periodsetting;
};

const seedData = async (): Promise<void> => {
  logger.info('Seeding database with fake data.');

  await seedPeriods();
  await seedPredefinedUsers();
  await seedRegularUsers();
  await seedQuantifierUsers();
  await seedPraises();
};

export {
  seedData,
  seedUser,
  seedUserAccount,
  seedUserAndUserAccount,
  seedPeriod,
  seedPeriods,
  seedPraise,
  seedPraises,
  seedQuantification,
  seedEventLog,
  seedSetting,
  seedPeriodSetting,
};
