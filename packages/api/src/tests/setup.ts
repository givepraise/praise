import logger from 'jet-logger';
import * as dotenv from 'dotenv';
import path from 'path';
import { Express } from 'express';
import request, { SuperTest, Test } from 'supertest';
import { exit } from 'process';
import { setup } from '../server';

interface TestContext extends Mocha.Context {
  app?: Express;
  client?: SuperTest<Test>;
}

export const mochaHooks = async (): Promise<Mocha.RootHookObject> => {
  return Promise.resolve({
    async beforeAll(this: TestContext): Promise<void> {
      const load = dotenv.config({
        path: path.join(__dirname, '..', '..', '/.env'),
      });
      if (load.error) {
        throw load.error;
      }

      this.app = await setup();
      this.client = request(this.app);
      logger.info('Running api tests:\n\n');
    },
    beforeEach(this: TestContext): void {
      this.client = request(this.app);
    },
    afterAll(): void {
      exit(0);
    },
  });
};
