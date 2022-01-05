import PraiseModel from '@entities/Praise';
import { BadRequestError, NotFoundError } from '@shared/errors';
import { getQuerySort } from '@shared/functions';
import { QuantificationCreateUpdateInput, QueryInput } from '@shared/inputs';
import { Request, Response } from 'express';

export const all = async (
  req: Request<any, QueryInput, any>,
  res: Response
): Promise<Response> => {
  const praises = await PraiseModel.paginate({
    ...req.query,
    sort: getQuerySort(req.query),
    populate: 'giver receiver',
  });

  return res.status(200).json(praises);
};

const single = async (req: Request, res: Response): Promise<Response> => {
  const praise = await PraiseModel.findById(req.params.id).populate(
    'giver receiver'
  );
  if (!praise) throw new NotFoundError('Praise');

  return res.status(200).json(praise);
};

const quantify = async (
  req: Request<any, QuantificationCreateUpdateInput, any>,
  res: Response
): Promise<Response> => {
  const praise = await PraiseModel.findById(req.params.id);
  if (!praise) throw new NotFoundError('Praise');

  const { score, dismissed, duplicatePraiseId } = req.body;
  const duplicatePraise = duplicatePraiseId ? duplicatePraiseId : null;

  const quantification = praise.quantifications.find((q) =>
    q.quantifier.equals(req.body.currentUser._id)
  );

  if (!quantification)
    throw new BadRequestError('User not assigned as quantifier for praise.');

  quantification.score = score;
  quantification.dismissed = dismissed;
  quantification.duplicatePraise = duplicatePraise;

  praise.save();

  return res.status(200).json(praise);
};

export default { all, single, quantify };
