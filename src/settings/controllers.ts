import { BadRequestError, NotFoundError } from '@shared/errors';
import { TypedRequestBody, TypedResponse } from '@shared/types';
import { Request, Response } from 'express';
import { SettingsModel } from './entities';
import { Setting, SettingSetInput } from './types';

export const all = async (
  req: Request,
  res: TypedResponse<Setting[]>
): Promise<TypedResponse<Setting[]>> => {
  const settings = await SettingsModel.find({});
  return res.status(200).json(settings);
};

export const single = async (
  req: Request,
  res: TypedResponse<Setting>
): Promise<TypedResponse<Setting>> => {
  const setting = await SettingsModel.findById(req.params.key);
  if (!setting) throw new NotFoundError('Settings');
  return res.status(200).json(setting);
};

export const set = async (
  req: TypedRequestBody<SettingSetInput>,
  res: Response
): Promise<TypedResponse<Setting>> => {
  if (!req.body.value) throw new BadRequestError('Value is required field');
  const setting = await SettingsModel.findById(req.params.key);
  if (!setting) throw new NotFoundError('Settings');
  setting.value = req.body.value; //TODO validate input
  setting.save();
  return res.status(200).json(setting);
};
