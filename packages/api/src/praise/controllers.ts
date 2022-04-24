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
import { praiseWithScore } from './utils/core';
import { calculatePraiseScore } from './utils/score';

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
  quantification.duplicatePraise = undefined;

  if (duplicatePraise) {
    const dp = await PraiseModel.findById(duplicatePraise);
    if (!dp) throw new BadRequestError('Duplicate praise item not found');

    const isDuplicateCircular =
      dp.quantifications.filter(
        (q) =>
          q.duplicatePraise &&
          q.duplicatePraise.toString() === praise._id.toString()
      ).length > 0;

    const isDuplicateSelf = duplicatePraise === praise.id;

    if (isDuplicateSelf || isDuplicateCircular) {
      throw new BadRequestError('Selected praise cannot be set as duplicate.');
    }

    quantification.duplicatePraise = dp._id;
  }

  await praise.save();
  const response = await praiseDocumentTransformer(praise);
  res.status(200).json(response);
};
