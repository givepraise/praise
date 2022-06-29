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
import {
  praiseDocumentListTransformer,
  praiseDocumentTransformer,
} from './transformers';
import {
  PraiseAllInput,
  PraiseDetailsDto,
  Praise,
  PraiseDocument,
  PraiseDto,
  QuantificationCreateUpdateInput,
  QuantifyMultiplePraiseInput,
} from './types';
import { praiseWithScore, getPraisePeriod } from './utils/core';
import { PeriodStatusType } from '@period/types';
import { quantifyPraise } from '@praise/utils/quantify';
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
  res: TypedResponse<PraiseDto[]>
): Promise<void> => {
  const affectedPraises = await quantifyPraise({
    id: req.params.id,
    bodyParams: req.body,
    currentUser: res.locals.currentUser,
  });

  const response = await praiseDocumentListTransformer(affectedPraises);
  res.status(200).json(response);
};

/**
 * Quantify multiple praise items
 * @param req
 * @param res
 */
export const quantifyMultiple = async (
  req: TypedRequestBody<QuantifyMultiplePraiseInput>,
  res: TypedResponse<PraiseDto[]>
): Promise<void> => {
  const { praiseIds } = req.body;

  const praiseItems = await Promise.all(
    praiseIds.map(async (id) => {
      const affectedPraises = await quantifyPraise({
        id,
        bodyParams: req.body,
        currentUser: res.locals.currentUser,
      });

      return affectedPraises;
    })
  );

  const response = await praiseDocumentListTransformer(praiseItems.flat());
  res.status(200).json(response);
};
