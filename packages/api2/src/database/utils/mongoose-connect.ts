import mongoose, { ConnectOptions } from 'mongoose';

interface DatabaseConfig {
  MONGO_USERNAME?: string;
  MONGO_PASSWORD?: string;
  MONGO_HOST?: string;
  MONGO_PORT?: string;
  MONGO_DB?: string;
}

/**
 * Connect to mongodb database with mongoose and return connected mongoose client
 */
export async function mongooseConnect(
  configOverride?: DatabaseConfig,
): Promise<typeof mongoose> {
  const { MONGO_USERNAME, MONGO_PASSWORD, MONGO_HOST, MONGO_PORT, MONGO_DB } =
    process.env;

  const config = {
    MONGO_USERNAME,
    MONGO_PASSWORD,
    MONGO_HOST,
    MONGO_PORT,
    MONGO_DB,
    ...configOverride,
  } as DatabaseConfig;

  const uri = `mongodb://${config.MONGO_USERNAME}:${config.MONGO_PASSWORD}@${config.MONGO_HOST}:${config.MONGO_PORT}/${config.MONGO_DB}?authSource=admin`;

  return await mongoose.connect(uri, {
    useNewUrlParser: true,
  } as ConnectOptions);
}
