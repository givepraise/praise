import { BadRequestError, NotFoundError } from '@error/errors';
import { TypedRequestBody, TypedResponse } from '@shared/types';
import { Request } from 'express';
import { SettingsModel } from './entities';
import { settingListTransformer, settingTransformer } from './transformers';
import { SettingDto, SettingSetInput } from './types';

export const all = async (
  req: Request,
  res: TypedResponse<SettingDto[]>
): Promise<void> => {
  const settings = await SettingsModel.find({});
  res.status(200).json(settingListTransformer(settings));
};

export const single = async (
  req: Request,
  res: TypedResponse<SettingDto>
): Promise<void> => {
  const setting = await SettingsModel.findById(req.params.key);
  if (!setting) throw new NotFoundError('Settings');
  res.status(200).json(settingTransformer(setting));
};

export const set = async (
  req: TypedRequestBody<SettingSetInput>,
  res: TypedResponse<SettingDto>
): Promise<void> => {
  const { value } = req.body;
  if (!value) throw new BadRequestError('Value is required field');
  const { id } = req.params;
  const setting = await SettingsModel.findById(id);
  if (!setting) throw new NotFoundError('Settings');
  setting.value = req.body.value; //TODO validate input
  await setting.save();
  res.status(200).json(settingTransformer(setting));
};
