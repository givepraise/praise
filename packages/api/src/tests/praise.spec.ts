import { Wallet } from 'ethers';
import { seedPraise, seedUser, seedUserAccount } from '../pre-start/seed';
import { expect } from 'chai';
import { loginUser } from './utils';
import { PraiseModel } from '@praise/entities';

describe('GET /api/praise/all', () => {
  beforeEach(async () => {
    await PraiseModel.deleteMany({});
  });

  it('200 response with json body containing paginated list of praises', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    await seedPraise();
    await seedPraise();
    await seedPraise();

    const response = await this.client
      .get('/api/praise/all?page=1&limit=10&sortColumn=createdAt&sortType=desc')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).to.have.property('docs');
    expect(response.body.docs.length).equals(3);
    expect(response.body.docs[0]).to.have.all.keys(
      '_id',
      'reasonRealized',
      'sourceId',
      'sourceName',
      'quantifications',
      'giver',
      'receiver',
      'createdAt',
      'updatedAt',
      'scoreRealized'
    );
  });

  it('200 response with json body containing paginated list of praises, filtered by reciever', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const receiver = await seedUserAccount();
    const receiver2 = await seedUserAccount();

    await seedPraise({ receiver: receiver._id });
    await seedPraise({ receiver: receiver._id });
    await seedPraise({ receiver: receiver._id });
    await seedPraise({ receiver: receiver2._id });

    const response = await this.client
      .get(
        `/api/praise/all?page=1&limit=10&sortColumn=createdAt&sortType=desc&receiver=${
          receiver._id.toString() as string
        }`
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).to.have.property('docs');
    expect(response.body.docs.length).equals(3);
    expect(response.body.docs[0]).to.have.all.keys(
      '_id',
      'reasonRealized',
      'sourceId',
      'sourceName',
      'quantifications',
      'giver',
      'receiver',
      'createdAt',
      'updatedAt',
      'scoreRealized'
    );
    expect(
      response.body.docs.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (d: any) => d.receiver._id === receiver._id.toString()
      ).length
    )
      .to.equal(response.body.docs.length)
      .to.equal(3);
  });

  it('401 response with json body if user not authenticated', function () {
    return this.client
      .get('/api/praise/all?page=1&limit=10&sortColumn=createdAt&sortType=desc')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);
  });
});

describe('GET /api/praise/:id', () => {
  beforeEach(async () => {
    await PraiseModel.deleteMany({});
  });

  it('200 response with json body containing a praise', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const praise = await seedPraise();

    const response = await this.client
      .get(`/api/praise/${praise._id.toString() as string}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body._id).equals(praise._id.toString());
    expect(response.body).to.have.all.keys(
      '_id',
      'reasonRealized',
      'sourceId',
      'sourceName',
      'quantifications',
      'giver',
      'receiver',
      'createdAt',
      'updatedAt',
      'scoreRealized'
    );
  });

  it('401 response with json body if user not authenticated', async function () {
    const praise = await seedPraise();

    return this.client
      .get(`/api/praise/${praise._id.toString() as string}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);
  });

  it('praise may contain a forwarder', async function () {
    const wallet = Wallet.createRandom();
    await seedUser({
      ethereumAddress: wallet.address,
    });
    const { accessToken } = await loginUser(wallet, this.client);

    const forwarder = await seedUserAccount();
    const praise = await seedPraise({ forwarder: forwarder._id });

    const response = await this.client
      .get(`/api/praise/${praise._id.toString() as string}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body._id).equals(praise._id.toString());
    expect(response.body).to.have.all.keys(
      '_id',
      'reasonRealized',
      'sourceId',
      'sourceName',
      'quantifications',
      'giver',
      'receiver',
      'createdAt',
      'updatedAt',
      'scoreRealized',
      'forwarder'
    );
  });
});
