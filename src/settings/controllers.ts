import { SettingsModel } from '@settings/entities';
import { BadRequestError, NotFoundError } from '@shared/errors';
import { QueryInput } from '@shared/inputs';
import { TypedRequestQuery, TypedResponse } from '@shared/types';
import { Request, Response } from 'express';
import { Settings, SettingsSetInput } from './types';

const all = async (
  req: TypedRequestQuery<QueryInput>,
  res: Response
): Promise<Response> => {
  const settings = await SettingsModel.find({});

  return res.status(200).json(settings);
};

const single = async (
  req: Request,
  res: TypedResponse<Settings>
): Promise<TypedResponse<Settings>> => {
  const setting = await SettingsModel.findById(req.params.key);
  if (!setting) throw new NotFoundError('Settings');

  return res.status(200).json(setting);
};

const set = async (
  req: Request<any, SettingsSetInput, any>,
  res: TypedResponse<Settings>
): Promise<TypedResponse<Settings>> => {
  const setting = await SettingsModel.findById(req.params.key);
  if (!setting) throw new NotFoundError('Settings');

  if (!req.body.value) throw new BadRequestError('Value is required field');

  setting.value = req.body.value;
  setting.save();

  return res.status(200).json(setting);
};

export { all, single, set };
