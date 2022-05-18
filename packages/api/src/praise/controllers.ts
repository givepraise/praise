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
import { EventLogTypeKey } from '@eventlog/types';
import { logEvent } from '@eventlog/utils';
import { Request } from 'express';
import { Types } from 'mongoose';
import { PraiseModel } from './entities';
import { praiseDocumentTransformer } from './transformers';
import {
  PraiseAllInput,
  PraiseDetailsDto,
  PraiseDto,
  QuantificationCreateUpdateInput,
} from './types';
import { praiseWithScore, getPraisePeriod } from './utils/core';

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

  if (!praisePagination)
    throw new BadRequestError('Failed to paginate praise data');

  const praiseDetailsDtoList: PraiseDetailsDto[] = await Promise.all(
    praisePagination.docs.map((p) => praiseWithScore(p))
  );

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

  const period = await getPraisePeriod(praise);
  if (!period)
    throw new BadRequestError('Praise does not have an associated period');

  const { score, dismissed, duplicatePraise } = req.body;

  if (!res.locals.currentUser?._id) {
    throw new InternalServerError('Current user not found.');
  }

  const quantification = praise.quantifications.find((q) =>
    q.quantifier.equals(res.locals.currentUser._id)
  );

  if (!quantification)
    throw new BadRequestError('User not assigned as quantifier for praise.');

  let eventLogMessage = '';

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

    quantification.score = 0;
    quantification.dismissed = false;
    quantification.duplicatePraise = dp._id;

    eventLogMessage = `Marked the praise with id "${(
      praise._id as Types.ObjectId
    ).toString()}" as duplicate of the praise with id "${(
      dp._id as Types.ObjectId
    ).toString()}"`;
  } else if (dismissed) {
    quantification.score = 0;
    quantification.dismissed = true;
    quantification.duplicatePraise = undefined;

    eventLogMessage = `Dismissed the praise with id "${(
      praise._id as Types.ObjectId
    ).toString()}"`;
  } else {
    quantification.score = score;
    quantification.dismissed = false;
    quantification.duplicatePraise = undefined;

    eventLogMessage = `Gave a score of ${
      quantification.score
    } to the praise with id "${(praise._id as Types.ObjectId).toString()}"`;
  }

  await praise.save();

  await logEvent(
    EventLogTypeKey.QUANTIFICATION,
    eventLogMessage,
    {
      userId: res.locals.currentUser._id,
    },
    period._id
  );

  const response = await praiseDocumentTransformer(praise);
  res.status(200).json(response);
};
