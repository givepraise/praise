import { model } from 'mongoose';
import { PraiseModel, PraiseSchema } from '../schemas/praise/12_praise.schema';
import { QuantificationSchema } from '../schemas/quantification/quantification.schema';
import { Quantification } from '../../quantifications/schemas/quantifications.schema';

const up = async (): Promise<void> => {
  const QuantificationModel = model<Quantification>(
    'Quantification',
    QuantificationSchema,
  );

  const praiseItems = await PraiseModel.find();

  const quantifications = praiseItems.reduce(
    (acc, praiseItem) => [
      ...acc,
      ...praiseItem.quantifications.map((quantification) => ({
        quantifier: quantification.quantifier,
        score: quantification.score,
        dismissed: quantification.dismissed,
        duplicatePraise: quantification.duplicatePraise,
        createdAt: quantification.createdAt,
        updatedAt: quantification.updatedAt,
        praise: praiseItem._id,
      })),
    ],
    [] as Quantification[],
  );

  await QuantificationModel.insertMany(quantifications);
};

const down = async (): Promise<void> => {
  const QuantificationModel = model<Quantification>(
    'Quantification',
    QuantificationSchema,
  );
  QuantificationModel.deleteMany({});
};

export { up, down };
