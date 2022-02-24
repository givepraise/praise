import { PraiseAllInput } from '@praise/types';
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

export const sanitize = (v: any) => {
  if (v instanceof Object) {
    for (const key in v) {
      if (/^\$/.test(key)) {
        delete v[key];
      } else {
        sanitize(v[key]);
      }
    }
  }

  return v;
};

export const getQuerySort = (input: QueryInput): Object => {
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

export const getPraiseAllInput = (q: PraiseAllInput) => {
  const { receiver, periodStart, periodEnd } = q;
  const query: any = {};

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

export const getQueryInput = (q: QueryInput) => {
  const { sortColumn, sortType, limit, page } = q;
  const query: any = {};

  query.sortColumn = sortColumn ? encodeURIComponent(sortColumn) : undefined;
  query.sortType = sortType ? encodeURIComponent(sortType) : undefined;
  query.limit = limit ? encodeURIComponent(limit) : undefined;
  query.page = page ? encodeURIComponent(page) : undefined;

  return query;
};
