import mongoose, { ConnectOptions } from 'mongoose';

interface DatabaseConfig {
  MONGO_USERNAME: string;
  MONGO_PASSWORD: string;
  MONGO_HOST: string;
  MONGO_PORT: string;
  MONGO_DB: string;
}

/**
 * Connect to mongodb database with mongoose and return connected mongoose client
 *
 * @param {(DatabaseConfig | {})} [configOverride={}]
 * @returns {Promise<typeof mongoose>}
 */
export const connectDatabase = async (
  configOverride: DatabaseConfig | {} = {},
): Promise<typeof mongoose> => {
  const { MONGO_USERNAME, MONGO_PASSWORD, MONGO_HOST, MONGO_PORT, MONGO_DB } =
    process.env;

  const configEnv = {
    MONGO_USERNAME,
    MONGO_PASSWORD,
    MONGO_HOST,
    MONGO_PORT,
    MONGO_DB,
  } as DatabaseConfig;

  const config = {
    ...configEnv,
    ...configOverride,
  } as DatabaseConfig;

  const uri = `mongodb://${config.MONGO_USERNAME}:${config.MONGO_PASSWORD}@${config.MONGO_HOST}:${config.MONGO_PORT}/${config.MONGO_DB}`;

  try {
    const db = await mongoose.connect(uri, {
      useNewUrlParser: true,
    } as ConnectOptions);

    return db;
  } catch (error) {
    throw Error('Could not connect to database');
  }
};

/**
 * Close database connection
 * @returns {Promise<void>}
 * @memberof Database
 * @throws {Error} - If connection could not be closed successfully (e.g. connection does not exist) an error is thrown
 */
export const closeDatabaseConnection = async (): Promise<void> => {
  await mongoose.connection.close();
};
