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
import { Request } from 'express';
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
  const query = getPraiseAllInput(req.query);
  const queryInput = getQueryInput(req.query);

  const praisePagination = await PraiseModel.paginate({
    query,
    ...queryInput,
    sort: getQuerySort(req.query),
    populate: 'giver receiver forwarder',
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
    'giver receiver forwarder'
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
    'giver receiver forwarder'
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
