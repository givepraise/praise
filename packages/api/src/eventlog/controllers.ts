import { getQueryInput, getQuerySort } from '@shared/functions';
import {
  PaginatedResponseBody,
  QueryInputParsedQs,
  TypedRequestQuery,
  TypedResponse,
} from '@shared/types';
import { StatusCodes } from 'http-status-codes';
import { EventLogModel } from './entities';
import { EventLogDto } from './types';
import { eventLogListTransformer } from './transformers';

/**
 * Fetch a paginated list of EventLogs
 */
export const all = async (
  req: TypedRequestQuery<QueryInputParsedQs>,
  res: TypedResponse<PaginatedResponseBody<EventLogDto>>
): Promise<void> => {
  const query = getQueryInput(req.query);

  const response = await EventLogModel.paginate({
    ...query,
    sort: getQuerySort(req.query),
  });

  const docs = response?.docs ? response.docs : [];
  const docsTransfomed = await eventLogListTransformer(docs);

  res.status(StatusCodes.OK).json({
    ...response,
    docs: docsTransfomed,
  });
};
