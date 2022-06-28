import { PeriodModel } from '@period/entities';
import { PraiseModel, QuantificationModel } from '@praise/entities';
import { UserModel } from '@user/entities';
import { UserAccountModel } from '@useraccount/entities';
import { UserAccountDocument } from '@useraccount/types';
import { PraiseDocument, QuantificationDocument } from '@praise/types';
import { PeriodDocument } from '@period/types';
import { insertNewPeriodSettings } from '@periodsettings/utils';
import { faker } from '@faker-js/faker';
import { UserDocument } from '@user/types';
import { EventLogDocument } from '@eventlog/types';
import { EventLogModel, EventLogTypeModel } from '@eventlog/entities';
import { SettingGroup, SettingDocument } from '@settings/types';
import { SettingsModel } from '@settings/entities';
import { PeriodSettingsModel } from '@periodsettings/entities';
import { PeriodSettingDocument } from '@periodsettings/types';

/**
 * Query database for two random useraccounts
 *
 * @returns {Promise<UserAccountDocument[]>}
 */
const fetchTwoRandomUserAccounts = async (): Promise<UserAccountDocument[]> => {
  const useraccounts = await UserAccountModel.aggregate([
    { $sample: { size: 2 } },
  ]);

  return useraccounts;
};

/**
 * Generate and save a fake UserAccount
 *
 * @param {Object} [userAccountData={}]
 * @return {Promise<UserAccountDocument>}
 */
export const seedUserAccount = async (
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

/**
 * Generate and save a fake User
 *
 * @param {Object} [userData={}]
 * @returns {Promise<UserDocument>}
 */
export const seedUser = async (
  userData: Object = {}
): Promise<UserDocument> => {
  const user = await UserModel.create({
    ethereumAddress: faker.finance.ethereumAddress(),
    roles: ['USER'],
    ...userData,
  });

  return user;
};

/**
 * Generate and save a fake User and associated fake UserAccount
 *
 * @param {Object} [userData={}]
 * @param {Object} [userAccountData={}]
 * @returns {Promise<[UserDocument, UserAccountDocument]>}
 */
export const seedUserAndUserAccount = async (
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

/**
 * Genreate and save a fake Period
 *
 * @param {Object} [periodData={}]
 * @returns {Promise<PeriodDocument>}
 */
export const seedPeriod = async (
  periodData: Object = {}
): Promise<PeriodDocument> => {
  const period = await PeriodModel.create({
    name: `Period ${faker.random.alpha()}`,
    status: 'OPEN',
    endDate: faker.date.future(),
    ...periodData,
  });
  await insertNewPeriodSettings(period);

  return period;
};

/**
 * Generate and save a fake Praise
 *
 * @param {Object} [praiseData={}]
 * @returns {Promise<PraiseDocument>}
 */
export const seedPraise = async (
  praiseData: Object = {}
): Promise<PraiseDocument> => {
  let [giver, receiver] = await fetchTwoRandomUserAccounts();

  if (!giver) {
    giver = await seedUserAccount();
  }
  if (!receiver) {
    receiver = await seedUserAccount();
  }

  const reason = faker.lorem.sentences();
  const praise = await PraiseModel.create({
    reason,
    reasonRealized: reason,
    giver: giver._id,
    sourceId: faker.datatype.uuid(),
    sourceName: faker.lorem.word(),
    receiver: receiver._id,
    createdAt: faker.date.future(),
    ...praiseData,
  });

  return praise;
};

/**
 * Generate a fake quantification and save to a given Praise
 *
 * @param {PraiseDocument} praise
 * @param {UserDocument} quantifierUser
 * @param {Object} [quantificationData={}]
 * @returns {Promise<QuantificationDocument>}
 */
export const seedQuantification = async (
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

/**
 * Generate and save a fake EventLog
 *
 * @param {Object} [eventLogData={}]
 * @returns {Promise<EventLogDocument>}
 */
export const seedEventLog = async (
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

/**
 * Generate and save a fake Setting
 *
 * @param {Object} [settingData={}]
 * @returns {Promise<SettingDocument>}
 */
export const seedSetting = async (
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

/**
 * Generate and save a fake PeriodSetting
 *
 * @param {Object} [periodSettingData={}]
 * @returns {Promise<PeriodSettingDocument>}
 */
export const seedPeriodSetting = async (
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
