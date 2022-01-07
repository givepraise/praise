import PraiseModel from '@entities/Praise';
import QuantificationModel from '@entities/Quantification';
import UserAccountModel from '@entities/UserAccount';
import { BadRequestError, NotFoundError } from '@shared/errors';
import { getQuerySort } from '@shared/functions';
import {
  PraiseImportInput,
  QuantificationCreateUpdateInput,
  QueryInput,
} from '@shared/inputs';
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
    { quantifier: res.locals.currentUser },
    {
      score,
      quantifier: res.locals.currentUser,
      dismissed,
      duplicatePraise,
    },
    { upsert: true, new: true }
  );

  praise.quantifications.push(quantification);
  praise.save();

  return res.status(200).json(praise);
};

const importData = async (req: Request, res: Response): Promise<Response> => {
  try {
    const reqData = JSON.parse(req.body.data);
    const data = await Promise.all(
      reqData.map(async (o: PraiseImportInput) => {
        const giver = await UserAccountModel.create({
          id: o.giver.id,
          username: o.giver.username,
          profileImageUrl: o.giver.profileImageUrl,
          platform: o.giver.platform,
        });

        const receiver = await UserAccountModel.create({
          id: o.recipients[0].id,
          username: o.recipients[0].username,
          profileImageUrl: o.recipients[0].profileImageUrl,
          platform: o.recipients[0].platform,
        });

        return {
          reason: o.praiseReason,
          sourceId: o.source.id,
          sourceName: o.source.name,
          giver,
          receiver,
        };
      })
    );

    PraiseModel.insertMany(data);

    return res.status(200).json(data);
  } catch (e) {
    throw new BadRequestError(e);
  }
};

export default { all, single, quantify, importData };
