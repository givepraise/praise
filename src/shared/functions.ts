import { QueryInput } from './inputs';
import { logger } from './Logger';

export const pErr = (err: Error) => {
  if (err) {
    logger.err(err);
  }
};

export const getRandomInt = () => {
  return Math.floor(Math.random() * 1_000_000_000_000);
};

export const getQuerySort = (input: QueryInput) => {
  const sort: any = {};

  if (input.sortColumn) {
    const sortColumn: any = input.sortColumn;
    const sortType: any = input.sortType;
    sort[sortColumn] = sortType === 'desc' ? -1 : 1;
  }

  return sort;
};
