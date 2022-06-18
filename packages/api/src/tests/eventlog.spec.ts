import { Wallet } from 'ethers';
import { seedEventLog, seedUser, seedUserAccount } from '../pre-start/seed';
import { expect } from 'chai';
import { loginUser } from './utils';
import { EventLogModel, EventLogTypeModel } from '@eventlog/entities';
import { logEvent } from '@eventlog/utils';
import { EventLogTypeKey } from '@eventlog/types';

describe('GET /api/eventlogs/all', () => {
  beforeEach(async () => {
    await EventLogModel.deleteMany({});
  });

  it('200 response with json body', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    return this.client
      .get(
        '/api/eventlogs/all?page=1&limit=10&sortColumn=createdAt&sortType=desc'
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
  });

  it('401 response with json body if user not authenticated', function () {
    return this.client
      .get(
        '/api/eventlogs/all?page=1&limit=10&sortColumn=createdAt&sortType=desc'
      )
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);
  });

  it('response body contains paginated list of eventlogs', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({ ethereumAddress: wallet.address });

    // note: loginUser creates 1 UserEventLog
    const { accessToken } = await loginUser(wallet, this.client);

    await seedEventLog();
    await seedEventLog();
    await seedEventLog();

    const response = await this.client
      .get(
        '/api/eventlogs/all?page=1&limit=10&sortColumn=createdAt&sortType=desc'
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).to.have.property('docs');
    expect(response.body.docs.length).equals(4);
  });
});

describe('logEvent', () => {
  beforeEach(async () => {
    await EventLogModel.deleteMany({});
  });

  it('creates a new EventLogDocument with the given type key, user, description', async () => {
    const eventTypeKey = EventLogTypeKey.PERMISSION;
    const eventType = await EventLogTypeModel.findOne({
      key: eventTypeKey,
    }).orFail();

    const wallet = Wallet.createRandom();
    const user = await seedUser({ ethereumAddress: wallet.address });
    const description = 'This is a description of an event';

    await logEvent(eventTypeKey, description, { userId: user._id });

    const eventLogs = await EventLogModel.find({});

    expect(eventLogs[0]).to.have.property('user');
    expect(eventLogs[0]).to.have.property('description');
    expect(eventLogs[0]).to.have.property('type');
    expect(eventLogs[0]).to.have.property('createdAt');

    expect(eventLogs[0].user?.toString()).equals(user._id.toString());
    expect(eventLogs[0].description).equals(description);
    expect(eventLogs[0].type.toString()).equals(eventType._id.toString());
  });
  it('creates a new EventLogDocument with the given type key, useraccount, description', async () => {
    const eventTypeKey = EventLogTypeKey.PERMISSION;
    const eventType = await EventLogTypeModel.findOne({
      key: eventTypeKey,
    }).orFail();

    const wallet = Wallet.createRandom();
    const user = await seedUser({ ethereumAddress: wallet.address });
    const useraccount = await seedUserAccount({ user: user._id });
    const description = 'This is a description of an event';

    await logEvent(eventTypeKey, description, {
      userAccountId: useraccount._id,
    });

    const eventLogs = await EventLogModel.find({});

    expect(eventLogs[0]).to.have.property('useraccount');
    expect(eventLogs[0]).to.have.property('description');
    expect(eventLogs[0]).to.have.property('type');
    expect(eventLogs[0]).to.have.property('createdAt');

    expect(eventLogs[0].useraccount?.toString()).equals(
      useraccount._id.toString()
    );
    expect(eventLogs[0].description).equals(description);
    expect(eventLogs[0].type.toString()).equals(eventType._id.toString());
  });
});
