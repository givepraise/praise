import { PraiseAllInput, PraiseExportInput } from '@praise/types';
import logger from 'jet-logger';
import { QueryInput } from './types';

export const pErr = (err: Error): void => {
  if (err) {
    logger.err(err);
  }
};

export const getRandomInt = (): number => {
  return Math.floor(Math.random() * 1_000_000_000_000);
};

export const getQuerySort = (input: QueryInput): Object => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sort: any = {};

  if (input.sortColumn) {
    const sortColumn: string = encodeURIComponent(input.sortColumn);
    const sortType: string | undefined = input.sortType
      ? encodeURIComponent(input.sortType)
      : undefined;
    sort[sortColumn] = sortType === 'desc' ? -1 : 1;
  }

  return sort;
};

export const getPraiseAllInput = (q: PraiseAllInput): Object => {
  const { receiver, periodStart, periodEnd } = q;
  const query: PraiseExportInput = {};

  if (receiver) {
    query.receiver = encodeURIComponent(receiver);
  }

  if (periodStart && periodEnd) {
    query.createdAt = {
      $gt: encodeURIComponent(periodStart),
      $lte: encodeURIComponent(periodEnd),
    };
  }

  return query;
};

export const getQueryInput = (q: QueryInput): Object => {
  const { sortColumn, sortType, limit, page } = q;
  const query: QueryInput = {};

  query.sortColumn = sortColumn ? encodeURIComponent(sortColumn) : undefined;
  query.sortType = sortType ? encodeURIComponent(sortType) : undefined;
  query.limit = limit ? encodeURIComponent(limit) : undefined;
  query.page = page ? encodeURIComponent(page) : undefined;

  return query;
};
