import { Response, Request } from 'express';
import { Parser } from 'json2csv';
import { isEmpty } from 'lodash';
import { BadRequestError, NotFoundError } from '@/error/errors';
import { PraiseDtoExtended, PraiseDetailsDto } from '@/praise/types';
import { praiseTransformer } from '@/praise/transformers';
import { calculateQuantificationScore } from '@/praise/utils/score';
import { UserModel } from '@/user/entities';
import { UserAccountModel } from '@/useraccount/entities';
import { settingValue } from '@/shared/settings';
import { objectsHaveSameKeys } from '@/shared/functions';
import { PraiseModel } from '@/praise/entities';
import { ExportContext } from '@/settings/types';
import {
  countPeriodPraiseItems,
  findPeriodDetailsDto,
  getPeriodDateRangeQuery,
} from '../utils/core';
import { PeriodModel } from '../entities';
import { populateGRListWithEthereumAddresses } from '../transformers';
import { getCustomExportTransformer } from '../utils/getCustomExportTransformer';
import { runCustomExportTransformer } from '../utils/runCustomExportTransformer';

// TODO document this
/**
 * …
 *
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export const full = async (req: Request, res: Response): Promise<void> => {
  const period = await PeriodModel.findOne({ _id: req.params.periodId });
  if (!period) throw new NotFoundError('Period');
  const periodDateRangeQuery = await getPeriodDateRangeQuery(period);

  const praises = await PraiseModel.find({
    createdAt: periodDateRangeQuery,
  }).populate('giver receiver forwarder');

  const quantificationsColumnsCount = (await settingValue(
    'PRAISE_QUANTIFIERS_PER_PRAISE_RECEIVER',
    period._id
  )) as number;

  const docs: PraiseDetailsDto[] = [];
  if (praises) {
    for (const praise of praises) {
      const pws: PraiseDtoExtended = await praiseTransformer(praise);

      const receiver = await UserModel.findById(pws.receiver.user);
      if (receiver) {
        pws.receiverUserDocument = receiver;
      }

      if (pws.giver && pws.giver.user) {
        const giver = await UserModel.findById(pws.giver.user);
        if (giver) {
          pws.giverUserDocument = giver;
        }
      }

      pws.quantifications = await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pws.quantifications.map(async (q: any) => {
          const quantifier = await UserModel.findById(q.quantifier._id);
          const account = await UserAccountModel.findOne({
            user: q.quantifier._id,
          });

          q.quantifier = quantifier;
          q.account = account;

          q.scoreRealized = await calculateQuantificationScore(q);

          return q;
        })
      );

      docs.push(pws);
    }
  }

  const fields = [
    {
      label: 'id',
      value: '_id',
    },
    {
      label: 'date',
      value: 'createdAt',
    },
    {
      label: 'to user account',
      value: 'receiver.name',
    },
    {
      label: 'to user account id',
      value: 'receiver._id',
    },
    {
      label: 'to eth address',
      value: 'receiverUserDocument.ethereumAddress',
    },
    {
      label: 'from user account',
      value: 'giver.name',
    },
    {
      label: 'from user account id',
      value: 'giver._id',
    },
    {
      label: 'from eth address',
      value: 'giverUserDocument.ethereumAddress',
    },
    {
      label: 'reason',
      value: 'reasonRealized',
    },
    {
      label: 'source id',
      value: 'sourceId',
    },
    {
      label: 'source name',
      value: 'sourceName',
    },
  ];

  for (let index = 0; index < quantificationsColumnsCount; index++) {
    const quantObj = {
      label: `score ${index + 1}`,
      value: `quantifications[${index}].score`,
    };

    fields.push(quantObj);
  }

  for (let index = 0; index < quantificationsColumnsCount; index++) {
    const quantObj = {
      label: `duplicate id ${index + 1}`,
      value: `quantifications[${index}].duplicatePraise`,
    };

    fields.push(quantObj);
  }

  for (let index = 0; index < quantificationsColumnsCount; index++) {
    const quantObj = {
      label: `dismissed ${index + 1}`,
      value: `quantifications[${index}].dismissed`,
    };

    fields.push(quantObj);
  }

  for (let index = 0; index < quantificationsColumnsCount; index++) {
    const quantUserUsernameObj = {
      label: `quantifier ${index + 1} username`,
      value: `quantifications[${index}].account.name`,
    };

    fields.push(quantUserUsernameObj);

    const quantUserEthAddressObj = {
      label: `quantifier ${index + 1} eth address`,
      value: `quantifications[${index}].quantifier.ethereumAddress`,
    };

    fields.push(quantUserEthAddressObj);
  }

  fields.push({
    label: 'avg score',
    value: 'scoreRealized',
  });

  const json2csv = new Parser({ fields: fields });
  const csv = json2csv.parse(docs);

  res.status(200).contentType('text/csv').attachment('data.csv').send(csv);
};

// TODO document this
/**
 * …
 *
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export const summary = async (req: Request, res: Response): Promise<void> => {
  const periodDetailsDto = await findPeriodDetailsDto(req.params.periodId);
  const receivers = await populateGRListWithEthereumAddresses(
    periodDetailsDto.receivers
  );

  const fields = [
    {
      label: 'user',
      value: 'username',
    },
    {
      label: 'praise_count',
      value: 'praiseCount',
    },
    {
      label: 'score',
      value: 'scoreRealized',
    },
  ];

  const json2csv = new Parser({ fields: fields });
  const csv = json2csv.parse(receivers);

  res.status(200).contentType('text/csv').attachment('data.csv').send(csv);
};

// TODO document this
/**
 * …
 *
 * @param {TypedRequestQuery<ExportCustomQueryInputParsedQs>} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export const custom = async (req: Request, res: Response): Promise<void> => {
  const customExportMapSetting = (await settingValue(
    'CUSTOM_EXPORT_MAP'
  )) as string;

  const customExportFormat = (await settingValue(
    'CUSTOM_EXPORT_FORMAT'
  )) as string;

  const context = isEmpty(req.query)
    ? ((await settingValue('CUSTOM_EXPORT_CONTEXT')) as ExportContext)
    : req.query;

  const supportPercentage = (await settingValue(
    'CS_SUPPORT_PERCENTAGE'
  )) as number;

  try {
    const periodDetailsDto = await findPeriodDetailsDto(req.params.periodId);

    const receivers = await populateGRListWithEthereumAddresses(
      periodDetailsDto.receivers
    );

    const transformer = await getCustomExportTransformer(
      customExportMapSetting
    );

    if (!objectsHaveSameKeys(context, transformer.context)) {
      throw new BadRequestError('Distribution parameters are not valid.');
    }

    const praiseItemsCount = await countPeriodPraiseItems(req.params.periodId);
    const totalPraiseScore = receivers
      .map((item) => item.scoreRealized)
      .reduce((prev, next) => prev + next);

    context.totalPraiseScore = totalPraiseScore;
    context.praiseItemsCount = praiseItemsCount;

    if (supportPercentage > 0) {
      const supportAmount = (totalPraiseScore * supportPercentage) / 100;
      receivers.push({
        _id: 'common-stack',
        scoreRealized: supportAmount,
        praiseCount: 0,
        identityEthAddress: '0xfa4EE6B523fC1E8B53015D7D81331d568CDb5906', // Intentionally hard coded
      });
      context.totalPraiseScore += supportAmount;
    }

    let summarizedReceiverData = runCustomExportTransformer(
      receivers,
      context,
      transformer
    );

    if (transformer.filterColumn) {
      summarizedReceiverData = summarizedReceiverData.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item) => (item as any)[transformer.filterColumn]
      );
    }

    let data = null;
    if (customExportFormat === 'csv') {
      const fields = Object.keys(transformer.map.item).map((item) => {
        return { label: item.toLowerCase(), value: item };
      });
      const json2csv = new Parser({
        fields: fields,
        header: transformer.includeCsvHeaderRow ?? true,
      });
      data = json2csv.parse(summarizedReceiverData);
      res.status(200).contentType('text/csv').attachment('data.csv').send(data);
    } else {
      data = summarizedReceiverData;
      res
        .status(200)
        .contentType('application/json')
        .attachment('data.json')
        .send(data);
    }
  } catch (e) {
    throw new BadRequestError((e as Error).message);
  }
};
