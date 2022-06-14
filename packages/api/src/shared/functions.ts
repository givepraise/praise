import { PraiseAllInput, PraiseExportInput } from 'types/dist/praise';
import logger from 'jet-logger';
import { QueryInput } from 'types/dist/query';
import { Request } from 'express';
import mime from 'mime-types';
import { UploadedFile } from 'express-fileupload';
import { BadRequestError, InternalServerError } from '@error/errors';
import { unlink } from 'fs/promises';

export const pErr = (err: Error): void => {
  if (err) {
    logger.err(err);
  }
};

export const getRandomInt = (): number => {
  return Math.floor(Math.random() * 1_000_000_000_000);
};

export const getRandomString = (length = 10): string => {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
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

export const upload = async (req: Request, key: string): Promise<string> => {
  const file = req.files;

  if (!file) {
    throw new BadRequestError('Uploaded file is missing.');
  }

  try {
    const logo: UploadedFile = file[key] as UploadedFile;
    const fileExtension: string = mime.extension(logo.mimetype) as string;

    const filename = `${getRandomString()}.${fileExtension}`;
    const dirname = 'uploads/';
    const path = `${dirname}${filename}`;

    await logo.mv(path);

    return path;
  } catch (e) {
    console.log('ERROR:', e);
    throw new InternalServerError('File upload failed.');
  }
};

export const removeFile = async (filename: string): Promise<void> => {
  try {
    await unlink(filename);
  } catch (e) {
    logger.warn(`Could not find a file to remove: ${filename}`);
  }
};
