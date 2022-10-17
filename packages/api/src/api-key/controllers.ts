import { Request } from 'express';
import { Types } from 'mongoose';
import { BadRequestError, NotFoundError } from '@/error/errors';
import {
  QueryInputParsedQs,
  TypedRequestBody,
  TypedRequestQuery,
  TypedResponse,
} from '@/shared/types';
import { EventLogTypeKey } from '@/eventlog/types';
import { logEvent } from '@/eventlog/utils';
import { ApiKeyModel } from './entities';
// import { userListTransformer, userTransformer } from './transformers';
import { ApiKeyDocument, ApiKeyDto, ApiKeyAccess } from './types';
import { findUser } from './utils/entity';

/**
 * Fetch all Users with their associated UserAccounts
 *
 * @param {TypedRequestQuery<QueryInputParsedQs>} req
 * @param {TypedResponse<PaginatedResponseBody<ApiKeyDto[]>>} res
 * @returns {Promise<void>}
 */
export const all = async (
  req: TypedRequestQuery<QueryInputParsedQs>,
  res: TypedResponse<ApiKeyDto[]>
): Promise<void> => {
  const apiKeys = await ApiKeyModel.paginate({
    ...req.query,
  });

  res.status(200).json(apiKeys);
};

/**
 * Fetch a User with their associated UserAccounts
 *
 * @param {Request} req
 * @param {TypedResponse<UserDto>} res
 * @returns {Promise<void>}
 */
export const single = async (
  req: Request,
  res: TypedResponse<ApiKeyDto>
): Promise<void> => {
  const { id } = req.params;
  const apikey = await ApiKeyModel.findById(id);
  if (!apikey) throw new NotFoundError('Api key');

  const result: ApiKeyDto = {
    _id: apikey._id,
    access: apikey.access,
    apikey: apikey.apikey,
    name: apikey.name,
    createdAt: String(apikey.createdAt),
    updatedAt: String(apikey.updatedAt),
  };

  res.status(200).json(result);
};

/**
 *  Create new API key
 */
export const addApiKey = async () => {};

/**
 * Delete an API key
 */
export const removeApiKey = async () => {};
