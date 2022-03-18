import * as dotenv from 'dotenv';
import 'express-async-errors';
import mongoose, { ConnectOptions } from 'mongoose';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '..', '/.env') });

/**
 *
 * @returns
 */
export const connectDb = async () => {
    const username = process.env.MONGO_USERNAME || '';
    const password = process.env.MONGO_PASSWORD || '';
    const host = process.env.MONGO_HOST || '';
    const port = process.env.MONGO_PORT || '';
    const dbName = process.env.MONGO_DB || '';
    const db = `mongodb://${username}:${password}@${host}:${port}/${dbName}`;

    const connection = await mongoose.connect(db, { useNewUrlParser: true } as ConnectOptions);

    return connection;
}