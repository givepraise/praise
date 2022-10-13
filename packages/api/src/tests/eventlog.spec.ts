import { Wallet } from 'ethers';
import { expect } from 'chai';
import { faker } from '@faker-js/faker';
import some from 'lodash/some';
import { EventLogModel, EventLogTypeModel } from '@/eventlog/entities';
import { logEvent } from '@/eventlog/utils';
import { EventLogTypeKey } from '@/eventlog/types';
import {
  seedEventLog,
  seedUser,
  seedUserAccount,
} from '@/database/seeder/entities';
import { loginUser } from './utils';

describe('GET /api/eventlogs/all', () => {
  beforeEach(async () => {
    await EventLogModel.deleteMany({});
  });

  it('200 response with json body', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      identityEthAddress: wallet.address,
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

  it('200 response with search parameter contains matching search results', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      identityEthAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const description = faker.random.alphaNumeric(25);
    const eventlog = await seedEventLog({ description });
    await seedEventLog();
    await seedEventLog();
    await seedEventLog();

    const response = await this.client
      .get(
        `/api/eventlogs/all?page=1&limit=10&sortColumn=createdAt&sortType=desc&search=${description}`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(some(response.body.docs, { _id: eventlog._id.toString() })).is.true;
  });

  it('200 response with search parameter does not contain non-matching search results', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      identityEthAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const description = faker.random.alphaNumeric(25);
    await seedEventLog({ description });
    const eventlog = await seedEventLog();
    const eventlog2 = await seedEventLog();
    const eventlog3 = await seedEventLog();

    const response = await this.client
      .get(
        `/api/eventlogs/all?page=1&limit=10&sortColumn=createdAt&sortType=desc&search=${description}`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(some(response.body.docs, { _id: eventlog._id.toString() })).is.false;
    expect(some(response.body.docs, { _id: eventlog2._id.toString() })).is
      .false;
    expect(some(response.body.docs, { _id: eventlog3._id.toString() })).is
      .false;
  });

  it('200 response with type parameter contains matching type results', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      identityEthAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const eventlogtype = await EventLogTypeModel.findOne({
      type: EventLogTypeKey.PERIOD,
    });

    const eventlog = await seedEventLog({ type: eventlogtype?._id });
    await seedEventLog();
    await seedEventLog();
    await seedEventLog();

    const response = await this.client
      .get(
        `/api/eventlogs/all?page=1&limit=10&sortColumn=createdAt&sortType=desc&type=${
          eventlogtype?.key as string
        }`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(some(response.body.docs, { _id: eventlog._id.toString() })).is.true;
  });

  it('200 response with type array parameter contains matching multiple type results', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      identityEthAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const eventlogtype = await EventLogTypeModel.findOne({
      type: EventLogTypeKey.PERIOD,
    });

    const eventlogtype2 = await EventLogTypeModel.findOne({
      type: EventLogTypeKey.PRAISE,
    });

    const eventlog = await seedEventLog({ type: eventlogtype?._id });
    const eventlog2 = await seedEventLog({ type: eventlogtype2?._id });
    await seedEventLog();
    await seedEventLog();
    await seedEventLog();

    const response = await this.client
      .get(
        `/api/eventlogs/all?page=1&limit=10&sortColumn=createdAt&sortType=desc&type=${
          eventlogtype?.key as string
        },${eventlogtype2?.key as string}`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(some(response.body.docs, { _id: eventlog._id.toString() })).is.true;
    expect(some(response.body.docs, { _id: eventlog2._id.toString() })).is.true;
  });

  it('200 response with type parameter does not contain non-matching type results', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      identityEthAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const eventlogtype = await EventLogTypeModel.findOne({
      type: EventLogTypeKey.PERIOD,
    });

    await seedEventLog({ type: eventlogtype?._id });
    const eventlog = await seedEventLog();
    const eventlog2 = await seedEventLog();
    const eventlog3 = await seedEventLog();

    const response = await this.client
      .get(
        `/api/eventlogs/all?page=1&limit=10&sortColumn=createdAt&sortType=desc&type=${
          eventlogtype?._id.toString() as string
        }`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(some(response.body.docs, { _id: eventlog._id.toString() })).is.false;
    expect(some(response.body.docs, { _id: eventlog2._id.toString() })).is
      .false;
    expect(some(response.body.docs, { _id: eventlog3._id.toString() })).is
      .false;
  });

  it('400 response if missing limit parameter', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      identityEthAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    return this.client
      .get('/api/eventlogs/all?page=1&sortColumn=createdAt&sortType=desc')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  it('400 response if missing page parameter', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      identityEthAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    return this.client
      .get('/api/eventlogs/all?limit=10&sortColumn=createdAt&sortType=desc')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400);
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
    await seedUser({ identityEthAddress: wallet.address });

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

describe('GET /api/eventlogs/types', () => {
  beforeEach(async () => {
    await EventLogModel.deleteMany({});
  });

  it('200 response with json body', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      identityEthAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    return this.client
      .get('/api/eventlogs/types')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
  });

  it('401 response with json body if user not authenticated', function () {
    return this.client
      .get('/api/eventlogs/types')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);
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
    const user = await seedUser({ identityEthAddress: wallet.address });
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
    const user = await seedUser({ identityEthAddress: wallet.address });
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
