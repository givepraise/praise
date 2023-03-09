import { Praise } from '@/model/praise/praise.dto';
import { Quantification } from '@/model/quantification/quantification.dto';

export const findPraiseQuantification = (
  praise: Praise,
  userId: string
): Quantification | undefined => {
  return praise.quantifications.find((q) => q.quantifier === userId);
};

export const shortenDuplicatePraise = (
  praise: Praise,
  userId: string
): string => {
  const q = findPraiseQuantification(praise, userId);
  return q && q.duplicatePraise ? q.duplicatePraise?.slice(-4) : '';
};
