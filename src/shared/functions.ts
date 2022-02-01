import { QueryInput } from './inputs';
import { logger } from './Logger';

export const pErr = (err: Error): void => {
  if (err) {
    logger.err(err);
  }
};

export const getRandomInt = (): number => {
  return Math.floor(Math.random() * 1_000_000_000_000);
};

export const getQuerySort = (input: QueryInput): Object => {
  const sort: any = {};

  if (input.sortColumn) {
    const sortColumn: string = input.sortColumn;
    const sortType: string | undefined = input.sortType;
    sort[sortColumn] = sortType === 'desc' ? -1 : 1;
  }

  return sort;
};
