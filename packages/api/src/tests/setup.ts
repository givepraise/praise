import logger from 'jet-logger';
import * as dotenv from 'dotenv';
import path from 'path';
import { Express } from 'express';
import request, { SuperTest, Test } from 'supertest';
import { setup } from '../server';

interface TestContext extends Mocha.Context {
  app?: Express;
  client?: SuperTest<Test>;
}

const mochaHooks = async (): Promise<Mocha.RootHookObject> => {
  return Promise.resolve({
    async beforeAll(this: TestContext): Promise<void> {
      // extend timeout to allow for long database migrations / application setup
      this.timeout(20000);

      const load = dotenv.config({
        path: path.join(__dirname, '..', '..', '/.env'),
      });
      if (load.error) {
        throw load.error;
      }

      this.app = await setup();
      logger.info('Running api tests:\n\n');

      this.timeout(2000);
    },
    beforeEach(this: TestContext): void {
      this.client = request(this.app);
    },
  });
};

export { mochaHooks };
