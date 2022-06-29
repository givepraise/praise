import logger from 'jet-logger';
import { Express } from 'express';
import request, { SuperTest, Test } from 'supertest';
import { setup } from '../server';

interface TestContext extends Mocha.Context {
  app?: Express;
  client?: SuperTest<Test>;
}

/**
 * Prepare environment for running test suite,
 *  executed by Mocha before any tests are run
 *
 * @returns {Promise<Mocha.RootHookObject>}
 */
const mochaHooks = async (): Promise<Mocha.RootHookObject> => {
  return Promise.resolve({
    async beforeAll(this: TestContext): Promise<void> {
      // You may need to extend this timeout
      //  to allow more time for database migrations
      this.timeout(60000);

      this.app = await setup();
      logger.info('Running api tests:\n\n');
    },
    beforeEach(this: TestContext): void {
      this.timeout(2000);
      this.client = request(this.app);
    },
  });
};

export { mochaHooks };
