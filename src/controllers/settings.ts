import SettingsModel from '@entities/Settings';
import { BadRequestError, NotFoundError } from '@shared/errors';
import { SettingsSetInput } from '@shared/inputs';
import { Request, Response } from 'express';

export const all = async (req: Request, res: Response): Promise<Response> => {
  const settings = await SettingsModel.find({});

  return res.status(200).json(settings);
};

export const single = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const settings = await SettingsModel.findOne({
    key: req.params.key.toUpperCase(),
  });

  if (!settings) throw new NotFoundError('Settings');

  return res.status(200).json(settings);
};

export const set = async (
  req: Request<any, SettingsSetInput, any>,
  res: Response
): Promise<Response> => {
  const settings = await SettingsModel.findOne({
    key: req.params.key.toUpperCase(),
  });

  if (!settings) throw new NotFoundError('Settings');
  if (!req.body.value) throw new BadRequestError('Value is required field');

  settings.value = req.body.value;
  settings.save();

  return res.status(200).json(settings);
};

export default { all, single, set };
