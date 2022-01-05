import PraiseModel from '@entities/Praise';
import QuantificationModel from '@entities/Quantification';
import { NotFoundError } from '@shared/errors';
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
  const praise = await PraiseModel.findById(req.params.id);
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

  const quantification = await QuantificationModel.findOneAndUpdate(
    { quantifier: req.body.currentUser },
    {
      score,
      quantifier: req.body.currentUser,
      dismissed,
      duplicatePraise,
    },
    { upsert: true, new: true }
  );

  praise.quantifications.push(quantification);
  praise.save();

  return res.status(200).json(praise);
};

export default { all, single, quantify };
