import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '@shared/errors';
import { getQuerySort } from '@shared/functions';
import {
  PaginatedResponseBody,
  Query,
  QueryInput,
  TypedRequestBody,
  TypedRequestQuery,
  TypedResponse,
} from '@shared/types';
import { UserModel } from '@user/entities';
import { Request, Response } from 'express';
import { Parser } from 'json2csv';
import { PraiseModel } from './entities';
import { praiseDocumentTransformer } from './transformers';
import {
  PraiseAllInput,
  PraiseDetailsDto,
  PraiseDto,
  QuantificationCreateUpdateInput,
} from './types';
import { calculatePraiseScore, praiseWithScore } from './utils';

interface PraiseAllInputParsedQs extends Query, QueryInput, PraiseAllInput {}

/**
 * //TODO add descriptiom
 */
export const all = async (
  req: TypedRequestQuery<PraiseAllInputParsedQs>,
  res: TypedResponse<PaginatedResponseBody<PraiseDetailsDto>>
): Promise<void> => {
  const { receiver, periodStart, periodEnd } = req.query;
  const query: any = {};
  if (receiver) {
    query.receiver = receiver;
  }

  if (periodStart && periodEnd) {
    query.createdAt = {
      $gt: periodStart,
      $lte: periodEnd,
    };
  }

  const praisePagination = await PraiseModel.paginate({
    query,
    ...req.query,
    sort: getQuerySort(req.query),
    populate: 'giver receiver',
  });

  const praiseDetailsDtoList: PraiseDetailsDto[] = [];
  if (praisePagination?.docs) {
    for (const praise of praisePagination.docs) {
      praiseDetailsDtoList.push(await praiseWithScore(praise));
    }
  }

  const response = {
    ...praisePagination,
    docs: praiseDetailsDtoList,
  };

  res.status(200).json(response);
};

/**
 * //TODO add descriptiom
 */
export const single = async (
  req: Request,
  res: TypedResponse<PraiseDetailsDto>
): Promise<void> => {
  const praise = await PraiseModel.findById(req.params.id).populate(
    'giver receiver'
  );
  if (!praise) throw new NotFoundError('Praise');
  const praiseDetailsDto: PraiseDetailsDto = await praiseDocumentTransformer(
    praise
  );
  praiseDetailsDto.score = await calculatePraiseScore(praise.quantifications);
  res.status(200).json(praiseDetailsDto);
};

/**
 * //TODO add descriptiom
 */
export const quantify = async (
  req: TypedRequestBody<QuantificationCreateUpdateInput>,
  res: TypedResponse<PraiseDto>
): Promise<void> => {
  const praise = await PraiseModel.findById(req.params.id).populate(
    'giver receiver'
  );
  if (!praise) throw new NotFoundError('Praise');

  const { score, dismissed, duplicatePraise } = req.body;

  if (!res.locals.currentUser?._id) {
    throw new InternalServerError('Current user not found.');
  }

  const quantification = praise.quantifications.find((q) =>
    q.quantifier.equals(res.locals.currentUser._id)
  );

  if (!quantification)
    throw new BadRequestError('User not assigned as quantifier for praise.');

  quantification.score = score;
  quantification.dismissed = dismissed;
  if (duplicatePraise) {
    const dp = await PraiseModel.findById(duplicatePraise);

    if (dp) {
      const circularDependency = dp.quantifications.find((q) => {
        if (!q.duplicatePraise) return null;
        return q.duplicatePraise.equals(praise._id);
      });

      if (duplicatePraise === praise.id || circularDependency) {
        throw new BadRequestError(
          'Selected praise cannot be set as duplicate.'
        );
      }

      quantification.duplicatePraise = dp._id;
    }
  } else {
    quantification.duplicatePraise = undefined;
  }

  await praise.save();
  const response = await praiseDocumentTransformer(praise);
  res.status(200).json(response);
};

/**
 * //TODO add descriptiom
 */
export const exportPraise = async (
  req: Request<any, QueryInput, any>, //TODO typed request
  res: Response
): Promise<void> => {
  const query: any = {};
  if (req.query.receiver) {
    query.receiver = req.query.receiver;
  }

  if (req.query.periodStart && req.query.periodEnd) {
    query.createdAt = {
      $gt: req.query.periodStart,
      $lte: req.query.periodEnd,
    };
  }
  if (!req.query.periodStart || !req.query.periodEnd) {
    throw new BadRequestError(
      'You need to specify start and end date for period.'
    );
  }

  const praises = await PraiseModel.aggregate([
    {
      $project: {
        reason: 1,
        quantifications: 1,
        sourceId: 1,
        sourceName: 1,
        giver: 1,
        receiver: 1,
        createdAt: {
          $dateToString: {
            date: '$createdAt',
            format: '%Y-%m-%d',
          },
        },
        averageScore: { $avg: '$quantifications.score' },
      },
    },
    {
      $match: {
        createdAt: { $gte: req.query.periodStart, $lte: req.query.periodEnd },
      },
    },
    {
      $lookup: {
        from: 'accounts',
        localField: 'giver',
        foreignField: '_id',
        as: 'giver',
      },
    },
    {
      $lookup: {
        from: 'accounts',
        localField: 'receiver',
        foreignField: '_id',
        as: 'receiver',
      },
    },
    {
      $project: {
        reason: 1,
        quantifications: 1,
        sourceId: 1,
        sourceName: 1,
        createdAt: 1,
        giver: { $arrayElemAt: ['$giver', 0] },
        receiver: { $arrayElemAt: ['$receiver', 0] },
        averageScore: 1,
      },
    },
  ]);

  const praiseQuantifications = await PraiseModel.aggregate([
    {
      $project: {
        quantificationsCount: { $size: '$quantifications' },
      },
    },
    { $sort: { quantificationsCount: -1 } },
    { $limit: 1 },
  ]);

  const quantificationsColumnsCount =
    praiseQuantifications[0].quantificationsCount;

  const docs = await Promise.all(
    praises.map(async (p) => {
      const receiver = await UserModel.findOne({
        accounts: p.receiver._id,
      });

      const giver = await UserModel.findOne({
        accounts: p.giver._id,
      });

      if (receiver) {
        p.receiver.ethAddress = receiver.ethereumAddress;
      }

      if (giver) {
        p.giver.ethAddress = giver.ethereumAddress;
      }

      return p;
    })
  );

  const fields = [
    {
      label: 'DATE',
      value: 'createdAt',
    },
    {
      label: 'TO',
      value: 'receiver.username',
    },
    {
      label: 'TO ETH ADDRESS',
      value: 'receiver.ethAddress',
    },
    {
      label: 'FROM',
      value: 'giver.username',
    },
    {
      label: 'FROM ETH ADDRESS',
      value: 'giver.ethAddress',
    },
    {
      label: 'REASON',
      value: 'reason',
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
      label: `QUANT SCORE ${index + 1}`,
      value: `quantifications[${index}].score`,
    };

    fields.push(quantObj);
  }

  for (let index = 0; index < quantificationsColumnsCount; index++) {
    const quantObj = {
      label: `DUPLICATE ID ${index + 1}`,
      value: `quantifications[${index}].duplicatePraise.sourceId`,
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

  fields.push({
    label: 'AVG QUANT',
    value: 'averageScore',
  });

  const json2csv = new Parser({ fields: fields });
  const csv = json2csv.parse(docs);

  res.attachment('data.csv');
  res.status(200).send(csv);
};
