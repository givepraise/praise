import { BadRequestError } from '@shared/errors';
import { settingFloat } from '@shared/settings';
import { PraiseModel } from './entities';
import { praiseDocumentTransformer } from './transformers';
import { PraiseDetailsDto, PraiseDocument, PraiseDto } from './types';

export const calculatePraiseScore = async (
  praise: PraiseDocument
): Promise<number> => {
  const duplicatePraisePercentage = await settingFloat(
    'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE'
  );
  if (!duplicatePraisePercentage)
    throw new BadRequestError(
      "Invalid setting 'PRAISE_QUANTIFY_DUPLICATE_PRAISE_PERCENTAGE'"
    );

  if (!praise.quantifications) return 0;

  let si = 0;
  let s = 0;
  for (const quantification of praise.quantifications) {
    if (quantification.score > 0) {
      s += quantification.score;
      si++;
    }
    if (quantification.duplicatePraise) {
      const p = await PraiseModel.findById(quantification.duplicatePraise);
      if (p) {
        for (const pq of p.quantifications) {
          if (
            pq?.quantifier &&
            quantification.quantifier &&
            pq.quantifier.equals(quantification.quantifier) &&
            pq.score > 0
          ) {
            s += pq.score * duplicatePraisePercentage;
            si++;
          }
        }
      }
    }
  }
  if (s > 0) {
    return Math.floor(s / si);
  }
  return 0;
};

export const praiseWithScore = async (
  praise: PraiseDocument
): Promise<PraiseDto> => {
  const praiseDetailsDto: PraiseDetailsDto = praiseDocumentTransformer(praise);
  praiseDetailsDto.score = await calculatePraiseScore(praise);
  return praiseDetailsDto;
};
