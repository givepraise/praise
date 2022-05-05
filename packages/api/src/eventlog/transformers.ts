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
  const { _id, label, description } = eventLogType;

  return {
    _id,
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

  const eventLogTypeDto = eventLogTypeTransformer(eventLogType);

  return {
    ...eventLog,
    user: eventLog.user.toString(),
    type: eventLogTypeDto,
    createdAt: eventLogType.createdAt.toISOString(),
    updatedAt: eventLogType.createdAt.toISOString(),
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
