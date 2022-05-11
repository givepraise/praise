import { UserAccountModel } from '@useraccount/entities';
import { userAccountTransformer } from '@useraccount/transformers';
import { EventLogTypeModel } from './entities';
import {
  EventLogDocument,
  EventLogDto,
  EventLogTypeDocument,
  EventLogTypeDto,
} from './types';

const eventLogTypeTransformer = (
  eventLogType: EventLogTypeDocument
): EventLogTypeDto => {
  const { key, label, description } = eventLogType;

  return {
    key,
    label,
    description,
  } as EventLogTypeDto;
};

export const eventLogTransformer = async (
  eventLog: EventLogDocument
): Promise<EventLogDto> => {
  const eventLogType = await EventLogTypeModel.findOne({
    _id: eventLog.type,
  }).orFail();

  const _id = eventLog._id.toString();
  const createdAt = eventLog.createdAt.toISOString();
  const updatedAt = eventLog.updatedAt.toISOString();
  const eventLogTypeDto = eventLogTypeTransformer(eventLogType);
  const user = eventLog.user ? eventLog.user : undefined;

  let useraccount = undefined;
  if (eventLog.useraccount) {
    const userAccountDocument = await UserAccountModel.findOne({
      _id: eventLog.useraccount,
    }).orFail();
    useraccount = userAccountTransformer(userAccountDocument);
  }

  return {
    _id,
    user,
    useraccount,
    type: eventLogTypeDto,
    description: eventLog.description,
    createdAt,
    updatedAt,
  } as EventLogDto;
};

export const eventLogListTransformer = async (
  eventLogs: EventLogDocument[]
): Promise<EventLogDto[]> => {
  const eventLogDtos = await Promise.all(
    eventLogs.map((eventLog) => eventLogTransformer(eventLog))
  );

  return eventLogDtos;
};
