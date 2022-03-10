import * as dotenv from 'dotenv';
import 'express-async-errors';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '..', '/.env') });

// Cookie Properties
export const cookieProps = Object.freeze({
  key: 'ExpressGeneratorTs',
  secret: process.env.COOKIE_SECRET,
  options: {
    httpOnly: true,
    signed: true,
    path: process.env.COOKIE_PATH,
    maxAge: Number(process.env.COOKIE_EXP),
    domain: process.env.COOKIE_DOMAIN,
    secure: process.env.SECURE_COOKIE === 'true',
  },
});

export enum RouteType {
  admin = 'ADMIN',
  user = 'USER',
}
