import '../loadEnv';
import * as dotenv from 'dotenv';
import 'express-async-errors';
import path from 'path';

import { connectDatabase } from '../database/connection';

export { connectDatabase };
