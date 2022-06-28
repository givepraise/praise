import { BadRequestError, NotFoundError } from '@error/errors';
import { removeFile, upload } from '@shared/functions';
import { TypedRequestBody, TypedResponse } from '@shared/types';
import { EventLogTypeKey } from '@eventlog/types';
import { logEvent } from '@eventlog/utils';
import { Request } from 'express';
import { SettingsModel } from './entities';
import { settingListTransformer, settingTransformer } from './transformers';
import { SettingDto, SettingSetInput } from './types';

/**
 * Fetch all settings
 *
 * @param {Request} req
 * @param {TypedResponse<SettingDto[]>} res
 * @returns {Promise<void>}
 */
export const all = async (
  req: Request,
  res: TypedResponse<SettingDto[]>
): Promise<void> => {
  const settings = await SettingsModel.find({});

  res.status(200).json(settingListTransformer(settings));
};

/**
 * Fetch single Setting
 *
 * @param {Request} req
 * @param {TypedResponse<SettingDto>} res
 * @returns {Promise<void>}
 */
export const single = async (
  req: Request,
  res: TypedResponse<SettingDto>
): Promise<void> => {
  const setting = await SettingsModel.findOne({
    _id: req.params.id,
    period: { $exists: 0 },
  });
  if (!setting) throw new NotFoundError('Settings');
  res.status(200).json(settingTransformer(setting));
};

/**
 * Update a Setting's value
 *
 * @param {TypedRequestBody<SettingSetInput>} req
 * @param {TypedResponse<SettingDto>} res
 * @returns {Promise<void>}
 */
export const set = async (
  req: TypedRequestBody<SettingSetInput>,
  res: TypedResponse<SettingDto>
): Promise<void> => {
  const { value } = req.body;

  if (typeof value === 'undefined' && !req.files)
    throw new BadRequestError('Value is required field');

  const { id } = req.params;
  const setting = await SettingsModel.findOne({
    _id: id,
    period: { $exists: 0 },
  });
  if (!setting) throw new NotFoundError('Settings');

  const originalValue = setting.value;
  if (req.files) {
    await removeFile(setting.value);
    const uploadRespone = await upload(req, 'value');
    if (uploadRespone) {
      setting.value = uploadRespone;
    }
  } else {
    setting.value = req.body.value; //TODO validate input
  }

  await setting.save();

  await logEvent(
    EventLogTypeKey.SETTING,
    `Updated global setting "${setting.label}" from "${originalValue}" to "${setting.value}"`,
    {
      userId: res.locals.currentUser._id,
    }
  );

  res.status(200).json(settingTransformer(setting));
};
