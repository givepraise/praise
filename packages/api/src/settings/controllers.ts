import { BadRequestError, NotFoundError } from '@shared/errors';
import { TypedRequestBody, TypedResponse } from '@shared/types';
import { Request } from 'express';
import { SettingsModel } from './entities';
import { Setting, SettingSetRequestBody } from './types';

export const all = async (
  req: Request,
  res: TypedResponse<Setting[]>
): Promise<void> => {
  const settings = await SettingsModel.find({});
  res.status(200).json(settings);
};

export const single = async (
  req: Request,
  res: TypedResponse<Setting>
): Promise<void> => {
  const setting = await SettingsModel.findById(req.params.key);
  if (!setting) throw new NotFoundError('Settings');
  res.status(200).json(setting);
};

export const set = async (
  req: TypedRequestBody<SettingSetRequestBody>,
  res: TypedResponse<Setting>
): Promise<void> => {
  if (!req.body.value) throw new BadRequestError('Value is required field');
  const setting = await SettingsModel.findById(req.params.key);
  if (!setting) throw new NotFoundError('Settings');
  setting.value = req.body.value; //TODO validate input
  await setting.save();
  res.status(200).json(setting);
};
