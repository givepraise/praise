import { BadRequestError, NotFoundError } from '@error/errors';
import { removeFile, upload } from '@shared/functions';
import { TypedRequestBody, TypedResponse } from '@shared/types';
import { Request } from 'express';
import { SettingSetInput } from 'types/dist/settings/types';
import { PeriodStatusType } from 'types/dist/period/types';
import { PeriodModel } from '@period/entities';
import { EventLogTypeKey } from 'types/dist/eventlog/types';
import { logEvent } from '@eventlog/utils';
import {
  periodsettingTransformer,
  periodsettingListTransformer,
} from './transformers';
import { PeriodSettingsModel } from './entities';
import { PeriodSettingDto } from 'types/dist/periodsettings/types';

export const all = async (
  req: Request,
  res: TypedResponse<PeriodSettingDto[]>
): Promise<void> => {
  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) throw new NotFoundError('Period');

  const settings = await PeriodSettingsModel.find({ period: period._id });

  res.status(200).json(periodsettingListTransformer(settings));
};

export const single = async (
  req: Request,
  res: TypedResponse<PeriodSettingDto>
): Promise<void> => {
  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) throw new NotFoundError('Period');

  const setting = await PeriodSettingsModel.findOne({
    _id: req.params.settingId,
    period: period._id,
  });
  if (!setting) throw new NotFoundError('Periodsetting');
  res.status(200).json(periodsettingTransformer(setting));
};

export const set = async (
  req: TypedRequestBody<SettingSetInput>,
  res: TypedResponse<PeriodSettingDto>
): Promise<void> => {
  const { value } = req.body;

  if (typeof value === 'undefined' && !req.files)
    throw new BadRequestError('Value is required field');

  const period = await PeriodModel.findById(req.params.periodId);
  if (!period) throw new NotFoundError('Period');
  if (period.status !== PeriodStatusType.OPEN)
    throw new BadRequestError(
      'Period settings can only be changed when period status is OPEN.'
    );

  const setting = await PeriodSettingsModel.findOne({
    _id: req.params.settingId,
    period: period._id,
  });
  if (!setting) throw new NotFoundError('PeriodSettings');

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
    `Updated period setting "${setting.label
    }" from ${originalValue} to ${setting.value.toString()} in period "${period.name
    }"`,
    {
      userId: res.locals.currentUser._id,
    }
  );

  res.status(200).json(periodsettingTransformer(setting));
};
