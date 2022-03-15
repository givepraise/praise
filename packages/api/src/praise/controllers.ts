import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '@error/errors';
import {
  getPraiseAllInput,
  getQueryInput,
  getQuerySort,
} from '@shared/functions';
import {
  PaginatedResponseBody,
  Query,
  QueryInput,
  TypedRequestBody,
  TypedRequestQuery,
  TypedResponse,
} from '@shared/types';
import { UserModel } from '@user/entities';
import { UserAccountModel } from '@useraccount/entities';
import { Request, Response } from 'express';
import { Parser } from 'json2csv';
import { PraiseModel } from './entities';
import { praiseDocumentTransformer } from './transformers';
import {
  PraiseAllInput,
  PraiseDetailsDto,
  PraiseDto,
  PraiseExportInput,
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
  const query = getPraiseAllInput(req.query);
  const queryInput = getQueryInput(req.query);

  const praisePagination = await PraiseModel.paginate({
    query,
    ...queryInput,
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
  praiseDetailsDto.score = await calculatePraiseScore(praise);
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
  req: TypedRequestBody<QueryInput>,
  res: Response
): Promise<void> => {
  const query: PraiseExportInput = {
    receiver: undefined,
    createdAt: undefined,
  };

  if (req.query.receiver) {
    query.receiver = String(req.query.receiver);
  }

  if (req.query.periodStart && req.query.periodEnd) {
    query.createdAt = {
      $gt: String(req.query.periodStart),
      $lte: String(req.query.periodEnd),
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
          },
        },
      },
    },
    {
      $match: {
        createdAt: { $gt: req.query.periodStart, $lte: req.query.periodEnd },
      },
    },
    {
      $lookup: {
        from: 'useraccounts',
        localField: 'giver',
        foreignField: '_id',
        as: 'giver',
      },
    },
    {
      $lookup: {
        from: 'useraccounts',
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
      if (p.receiver && p.receiver.user) {
        const receiver = await UserModel.findById(p.receiver.user);

        if (receiver) {
          p.receiver.ethAddress = receiver.ethereumAddress;
        }
      }

      if (p.giver && p.giver.user) {
        const giver = await UserModel.findById(p.giver.user);

        if (giver) {
          p.giver.ethAddress = giver.ethereumAddress;
        }
      }

      p.quantifications = await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        p.quantifications.map(async (q: any) => {
          //TODO Fix any type            ☝️
          const quantifier = await UserModel.findById(q.quantifier._id);

          const account = await UserAccountModel.findOne({
            user: q.quantifier._id,
          });

          q.quantifier = quantifier;
          q.account = account;

          return q;
        })
      );

      p.averageScore = await calculatePraiseScore(p);

      return p;
    })
  );

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
      label: 'TO ETH ADDRESS',
      value: 'receiver.ethAddress',
    },
    {
      label: 'FROM USER ACCOUNT',
      value: 'giver.name',
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
    value: 'averageScore',
  });

  const json2csv = new Parser({ fields: fields });
  const csv = json2csv.parse(docs);

  res.attachment('data.csv');
  res.status(200).send(csv);
};
