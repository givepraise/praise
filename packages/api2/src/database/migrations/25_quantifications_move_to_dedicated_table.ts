import { model } from 'mongoose';
import { PraiseSchema } from '../schemas/praise/12_praise.schema';
import { QuantificationSchema } from '../schemas/quantification/quantification.schema';
import { Quantification } from '../../quantifications/schemas/quantifications.schema';
import { MigrationsContext } from '../interfaces/migration-context.interface';

const up = async ({ context }: MigrationsContext): Promise<void> => {
  const PraiseModel = model('Praise', PraiseSchema);
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
