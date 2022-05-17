import { getQuerySort } from '@shared/functions';
import {
  PaginatedResponseBody,
  QueryInputParsedQs,
  TypedRequestQuery,
  TypedResponse,
} from '@shared/types';
import { BadRequestError } from '@error/errors';
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
  if (!req.query.limit || !req.query.page)
    throw new BadRequestError('limit and page are required');

  const paginateQuery = {
    query: {},
    limit: parseInt(req.query.limit),
    page: parseInt(req.query.page),
    sort: getQuerySort(req.query),
  };

  const response = await EventLogModel.paginate(paginateQuery);

  if (!response) throw new BadRequestError('Failed to query event logs');

  const docs = response.docs ? response.docs : [];
  const docsTransfomed = await eventLogListTransformer(
    docs,
    res.locals.currentUser.roles
  );

  res.status(StatusCodes.OK).json({
    ...response,
    docs: docsTransfomed,
  });
};
