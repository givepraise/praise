import request, { SuperTest, Test } from 'supertest';
import logger from 'jet-logger';
import { exit } from 'process';
import * as dotenv from 'dotenv';
import path from 'path';
import { setup } from '../server';

const load = dotenv.config({ path: path.join(__dirname, '..', '..', '/.env') });
if (load.error) {
  throw load.error;
}

let client: SuperTest<Test>;

before(async () => {
  const app = await setup();

  client = request(app);
  logger.info('Running api tests:\n\n');
});

after(() => {
  exit(0);
});

describe('GET /api/auth/nonce', () => {
  it('200 response', () => {
    const ETHEREUM_ADDRESS = '0x1234';

    return client
      .get(`/api/auth/nonce?ethereumAddress=${ETHEREUM_ADDRESS}`)
      .expect(200);
  });
  it('404 response when missing ethereumAddress', () => {
    const ETHEREUM_ADDRESS = '';

    return client
      .get(`/api/auth/nonce?ethereumAddress=${ETHEREUM_ADDRESS}`)
      .expect(404);
  });
});