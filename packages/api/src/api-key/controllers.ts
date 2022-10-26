import { Request, Response } from 'express';
import { v4 } from 'uuid';
import { BadRequestError, NotFoundError } from '@/error/errors';
import { TypedResponse } from '@/shared/types';
import { ApiKeyModel } from './entities';
import { ApiKeyDto, ApiKeyAccess } from './types';

/**
 * Fetch all API keys
 *
 * @param {Request} req
 * @param {TypedResponse<ApiKeyDto[]>} res
 * @returns {Promise<void>}
 */
export const all = async (
  req: Request,
  res: TypedResponse<ApiKeyDto[]>
): Promise<void> => {
  const apiKeys = await ApiKeyModel.find({});
  const apiKeysDto: ApiKeyDto[] = [];
  for (const apikey of apiKeys) {
    apiKeysDto.push({
      _id: apikey._id,
      access: apikey.access,
      apikey: apikey.apikey,
      name: apikey.name,
      createdAt: apikey.createdAt.toISOString(),
      updatedAt: apikey.updatedAt.toISOString(),
    });
  }

  res.status(200).json(apiKeysDto);
};

/**
 * Fetch an API key
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
    createdAt: apikey.createdAt.toISOString(),
    updatedAt: apikey.updatedAt.toISOString(),
  };

  res.status(200).json(result);
};

/**
 *  Create new API key
 *
 * @param {Request} req
 * @param {TypedResponse} res
 * @returns {Promise<void>}
 */
export const addApiKey = async (req: Request, res: Response): Promise<void> => {
  const { name, access } = req.body;
  if (!(access in ApiKeyAccess))
    throw new BadRequestError('Invalid access type');
  const newApiKey = new ApiKeyModel({
    name,
    access: [access],
    apikey: v4(),
  });
  await newApiKey.save();

  res.status(201).json();
};

/**
 * Delete an API key
 *
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export const removeApiKey = async (
  req: Request,
  res: Response
): Promise<void> => {
  await ApiKeyModel.deleteOne({ _id: req.query.id });

  res.status(200).json();
};
