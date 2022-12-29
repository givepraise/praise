import { Praise } from '@/praise/schemas/praise.schema';
import { userAccountStub } from '@/useraccounts/test/stubs/useraccount.stub';
import { Types } from 'mongoose';

export const praiseStub: Praise = {
  _id: new Types.ObjectId('621f79e143b89009366c841c'),
  reason: 'for making edits in the welcome text',
  sourceId: 'DISCORD:810180621930070088:810180622336262195',
  sourceName:
    'DISCORD:Token%20Engineering%20Commons:%F0%9F%99%8F%EF%BD%9Cpraise',
  giver: userAccountStub,
  receiver: userAccountStub,
  forwarder: userAccountStub,
  createdAt: new Date(),
  updatedAt: new Date(),
  reasonRaw: 'for making edits in the welcome text',
  score: 144,
  quantifications: [],
};
