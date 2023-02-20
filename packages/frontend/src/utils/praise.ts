import { PraiseDto } from '@/model/praise/praise.dto';
import { QuantificationDto } from '@/model/quantification/quantification.dto';

export const findPraiseQuantification = (
  praise: PraiseDto,
  userId: string
): QuantificationDto | undefined => {
  return praise.quantifications.find((q) => q.quantifier === userId);
};

export const shortenDuplicatePraise = (
  praise: PraiseDto,
  userId: string
): string => {
  const q = findPraiseQuantification(praise, userId);
  return q && q.duplicatePraise ? q.duplicatePraise?.slice(-4) : '';
};
