import * as dotenv from 'dotenv';
import 'express-async-errors';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '..', '/.env') });

import { connectDatabase } from '../database/connection';

export { connectDatabase };