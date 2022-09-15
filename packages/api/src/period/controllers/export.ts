import { Response } from 'express';
import { Parser } from 'json2csv';
import { BadRequestError, NotFoundError } from '@/error/errors';
import { PraiseDtoExtended, PraiseDetailsDto } from '@/praise/types';
import { praiseTransformer } from '@/praise/transformers';
import { calculateQuantificationScore } from '@/praise/utils/score';
import { UserModel } from '@/user/entities';
import { UserAccountModel } from '@/useraccount/entities';
import { settingValue } from '@/shared/settings';
import { TypedRequestBody, QueryInput } from '@/shared/types';
import { objectsHaveSameKeys } from '@/shared/functions';
import { PraiseModel } from '@/praise/entities';
import { findPeriodDetailsDto, getPeriodDateRangeQuery } from '../utils/core';
import { PeriodModel } from '../entities';
import { populateGRListWithEthereumAddresses } from '../transformers';
import {
  getExportTransformer,
  getSummarizedReceiverData,
} from '../utils/export';

/**
 * Generate a CSV of Praise and quantification data for a period
 *
 * @param {TypedRequestBody<QueryInput>} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export const exportPraise = async (
  req: TypedRequestBody<QueryInput>,
  res: Response
): Promise<void> => {
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
      label: 'ID',
      value: '_id',
    },
    {
      label: 'DATE',
      value: 'createdAt',
    },
    {
      label: 'TO USER ACCOUNT',
      value: 'receiver.name',
    },
    {
      label: 'TO USER ACCOUNT ID',
      value: 'receiver._id',
    },
    {
      label: 'TO ETH ADDRESS',
      value: 'receiverUserDocument.ethereumAddress',
    },
    {
      label: 'FROM USER ACCOUNT',
      value: 'giver.name',
    },
    {
      label: 'FROM USER ACCOUNT ID',
      value: 'giver._id',
    },
    {
      label: 'FROM ETH ADDRESS',
      value: 'giverUserDocument.ethereumAddress',
    },
    {
      label: 'REASON',
      value: 'reasonRealized',
    },
    {
      label: 'SOURCE ID',
      value: 'sourceId',
    },
    {
      label: 'SOURCE NAME',
      value: 'sourceName',
    },
  ];

  for (let index = 0; index < quantificationsColumnsCount; index++) {
    const quantObj = {
      label: `SCORE ${index + 1}`,
      value: `quantifications[${index}].score`,
    };

    fields.push(quantObj);
  }

  for (let index = 0; index < quantificationsColumnsCount; index++) {
    const quantObj = {
      label: `DUPLICATE ID ${index + 1}`,
      value: `quantifications[${index}].duplicatePraise`,
    };

    fields.push(quantObj);
  }

  for (let index = 0; index < quantificationsColumnsCount; index++) {
    const quantObj = {
      label: `DISMISSED ${index + 1}`,
      value: `quantifications[${index}].dismissed`,
    };

    fields.push(quantObj);
  }

  for (let index = 0; index < quantificationsColumnsCount; index++) {
    const quantUserUsernameObj = {
      label: `QUANTIFIER ${index + 1} USERNAME`,
      value: `quantifications[${index}].account.name`,
    };

    fields.push(quantUserUsernameObj);

    const quantUserEthAddressObj = {
      label: `QUANTIFIER ${index + 1} ETH ADDRESS`,
      value: `quantifications[${index}].quantifier.ethereumAddress`,
    };

    fields.push(quantUserEthAddressObj);
  }

  fields.push({
    label: 'AVG SCORE',
    value: 'scoreRealized',
  });

  const json2csv = new Parser({ fields: fields });
  const csv = json2csv.parse(docs);

  res.status(200).contentType('text/csv').attachment('data.csv').send(csv);
};

/**
 * Return period receivers
 *
 * @param {TypedRequestBody<QueryInput>} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export const exportSummary = async (
  req: TypedRequestBody<QueryInput>,
  res: Response
): Promise<void> => {
  const periodDetailsDto = await findPeriodDetailsDto(req.params.periodId);
  const receivers = await populateGRListWithEthereumAddresses(
    periodDetailsDto.receivers
  );

  const fields = [
    {
      label: 'NAME',
      value: 'userAccount.nameRealized',
    },
    {
      label: 'PRAISE COUNT',
      value: 'praiseCount',
    },
    {
      label: 'SCORE',
      value: 'scoreRealized',
    },
  ];

  const json2csv = new Parser({ fields: fields });
  const csv = json2csv.parse(receivers);

  res.status(200).contentType('text/csv').attachment('data.csv').send(csv);
};

/**
 * Return period receivers
 *
 * @param {TypedRequestBody<QueryInput>} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export const customExport = async (
  req: TypedRequestBody<QueryInput>,
  res: Response
): Promise<void> => {
  const customExportMapSetting = (await settingValue(
    'CUSTOM_EXPORT_MAP'
  )) as string;

  const exportFormat = (await settingValue(
    'CUSTOM_EXPORT_CSV_FORMAT'
  )) as string;

  const customExportContext = req.query.context
    ? (req.query.context as string)
    : ((await settingValue('CUSTOM_EXPORT_CONTEXT')) as string);

  const supportPercentage = req.query.supportPercentage
    ? ((await settingValue('CS_SUPPORT_PERCENTAGE')) as number)
    : 0;

  const periodDetailsDto = await findPeriodDetailsDto(req.params.periodId);
  const receivers = await populateGRListWithEthereumAddresses(
    periodDetailsDto.receivers
  );

  // Summarise total scor

  try {
    const parsedContext = JSON.parse(customExportContext);
    const transformer = await getExportTransformer(customExportMapSetting);

    console.log('TRANSFORMER:', transformer);

    if (!objectsHaveSameKeys(parsedContext, transformer.context)) {
      throw new BadRequestError('Distribution parameters are not valid.');
    }

    // Add total number of praise items to context - totalPraiseItems

    // Add total score to context - totalPraiseScore
    //     .map((item) => item.scoreRealized)
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    //    .reduce((prev, next) => prev + next);

    // Add a new "receiver" with cs ethereum address to context
    // Set cs praise score based on support percentage
    // Ethereum address can be hard coded

    const summarizedReceiverData = getSummarizedReceiverData(
      receivers,
      customExportContext,
      supportPercentage,
      transformer
    );

    let data = null;
    if (exportFormat === 'csv') {
      const fields = Object.keys(transformer.map.item).map((item) => {
        return { label: item.toUpperCase(), value: item };
      });
      const json2csv = new Parser({ fields: fields });
      data = json2csv.parse(summarizedReceiverData);
    } else {
      data = summarizedReceiverData;
    }

    res.status(200).contentType('text/csv').attachment('data.csv').send(data);
  } catch (e) {
    throw new BadRequestError((e as Error).message);
  }
};
